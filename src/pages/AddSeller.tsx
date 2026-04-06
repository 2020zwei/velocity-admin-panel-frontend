import { Button } from "@/components/Button";
import Dropdown, { type Option } from "@/components/Dropdown";
import Icon from "@/components/Icon";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/hooks/useApi";
import Spinner from "@/components/Spinner";
import { GetState } from "react-country-state-city";
import { useDebounce } from "@/helper/debounce";
import { optionGenerator } from "@/helper/optionGenerator";
import zipcodes from "zipcodes";

const sellerSchema = z.object({
    name: z.string().min(1, "Sales Agent Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    dealer_code: z.string().min(1, "Dealer Code is required"),
    territory_state: z.string().min(1, "Territory - State is required"),
    zip_code: z.string().min(1, "Zip Code is required"),
    // keywords: z.array(z.string()).min(1, "Select at least one keyword"),
    approver_ids: z.array(z.number()),
});

type SellerFormValues = z.infer<typeof sellerSchema>;

const PAGE_SIZE = 10;

const mergeUniqueByValue = (prev: Option[], next: Option[]) => {
    const map = new Map<Option["value"], Option>();
    prev.forEach((o) => map.set(o.value, o));
    next.forEach((o) => map.set(o.value, o));
    return Array.from(map.values());
};

// robust extractors (in case backend shape varies a bit)
const extractApprovers = (res: any) => res?.results?.data?.approvers ?? [];
const extractCount = (res: any) =>
    res?.count ?? res?.results?.count ?? res?.results?.data?.count ?? 0;

const parseZipCodes = (value: string): string[] => {
    const matches = String(value || "").match(/\b\d{5}(?:-\d{4})?\b/g) ?? [];
    return Array.from(new Set(matches));
};

const parseCsvList = (value: string): string[] =>
    Array.from(
        new Set(
            String(value || "")
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
        )
    );

const resolveStateCode = (token: string, options: Option[]): string | null => {
    const normalized = token.trim().toLowerCase();
    if (!normalized) return null;
    const byCode = options.find((o) => String(o.value).toLowerCase() === normalized);
    if (byCode) return String(byCode.value);
    const byName = options.find((o) => o.label.toLowerCase() === normalized);
    if (byName) return String(byName.value);
    if (normalized.length === 2) return normalized.toUpperCase();
    return null;
};

const getReadableApiMessage = (err: any): string => {
    const raw =
        err?.response?.data?.message ??
        err?.response?.data?.errors?.validationError ??
        err?.response?.data?.error_message ??
        err?.message;

    if (!raw) return "Unable to submit right now. Please try again.";

    const text = String(raw);
    const detailMatch = text.match(/ErrorDetail\(string='([^']+)'/);
    if (detailMatch?.[1]) return detailMatch[1];

    return text
        .replace(/ErrorDetail\(string='/g, "")
        .replace(/', code='[^']+'\)/g, "")
        .replace(/[{}[\]]/g, "")
        .replace(/'email':/gi, "Email:")
        .trim();
};

const AddSeller = () => {
    // const [filterdKeywords, setFilterdKeywords] = useState<string[]>([]);
    // const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const { state, search } = useLocation();
    const [states, setStates] = useState<Option[]>([]);
    const [showZipPicker, setShowZipPicker] = useState(false);
    const [showStatePicker, setShowStatePicker] = useState(false);
    const [stateSearch, setStateSearch] = useState("");
    const [zipSearch, setZipSearch] = useState("");
    const [pendingZipCodes, setPendingZipCodes] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState("");
    // ✅ Approvers
    const [approverOptions, setApproverOptions] = useState<Option[]>([]);
    const [approverCount, setApproverCount] = useState<number>(0);

    const editId = search.slice(search.lastIndexOf("=") + 1);
    
    const navigate = useNavigate();

    // query + paging refs
    const approverQueryRef = useRef<string>("");
    const activeSeqRef = useRef(0); // increments on new search
    const loadedPagesByQueryRef = useRef<Map<string, Set<number>>>(new Map());

    const {
        isLoading: approverLoading,
        isRefetching: approverRefetching,
        isFetching: approverFetching,
        refetch: refetchApprovers,
    } = useApi<any>({
        url: "/approvers",
        auto: false,
        transformResponse: (d) => d,
    });

    // const { data: keywordData, isLoading: isKeywordLoading } = useApi<{
    //     data: { keywords: any[] };
    // }>({
    //     url: `/keywords`,
    // });

    const { isLoading, refetch: callApi } = useApi<{ results: any[] }>({
        url: editId ? `/admin/sales-reps/${editId}` : "/admin/sales-reps/invite/",
        method: state?.id ? "patch" : "post",
        auto: false,
        transformResponse: (d) => d,
    });

    const totalPages 
    = useMemo(
        () => Math.ceil((approverCount || 0) / PAGE_SIZE),
        [approverCount]
    );

    // ---------------------------
    // Approver fetch (single source of truth)
    // ---------------------------
    const fetchApprovers = useCallback(
        async ({
            query,
            page,
            replace,
            seq,
        }: {
            query: string;
            page: number;
            replace: boolean;
            seq: number;
        }) => {
            // block duplicate same-page loads for same query
            const key = query || "";
            const pagesSet =
                loadedPagesByQueryRef.current.get(key) ?? new Set<number>();
            if (pagesSet.has(page)) return;

            pagesSet.add(page);
            loadedPagesByQueryRef.current.set(key, pagesSet);

            try {
                const res = await refetchApprovers({
                    url: "/admin/approvers",
                    params: {
                        page,
                        limit: PAGE_SIZE,
                        ...(query ? { search: query } : {}),
                    } as any,
                });

                // if a newer search started, ignore this result
                if (seq !== activeSeqRef.current) return;

                const approvers = extractApprovers(res);
                const count = extractCount(res);

                const newOpts = optionGenerator("name", "id", approvers);

                setApproverCount(count);
                setApproverOptions((prev) =>
                    replace ? mergeUniqueByValue([], newOpts) : mergeUniqueByValue(prev, newOpts)
                );
            } catch (e) {
                // allow retry for this page if request failed
                const setForQuery = loadedPagesByQueryRef.current.get(key);
                setForQuery?.delete(page);
            }
        },
        [refetchApprovers]
    );

    // initial approvers load
    useEffect(() => {
        approverQueryRef.current = "";
        activeSeqRef.current += 1;
        const seq = activeSeqRef.current;

        setApproverOptions([]);
        setApproverCount(0);
        loadedPagesByQueryRef.current.set("", new Set());

        void fetchApprovers({ query: "", page: 1, replace: true, seq });
    }, [fetchApprovers]);

    // debounced server search
    const debouncedSearch = useDebounce((v: string) => {
        const query = v.trim();
        approverQueryRef.current = query;

        activeSeqRef.current += 1;
        const seq = activeSeqRef.current;

        // reset paging for this query
        loadedPagesByQueryRef.current.set(query, new Set());
        setApproverOptions([]);
        setApproverCount(0);

        void fetchApprovers({ query, page: 1, replace: true, seq });
    }, 500);

    // dropdown search handler
    const handleApproverSearch = async (searchText: string) => {
        const q = searchText.toLowerCase().trim();

        if (!q) {
            // reset to default list
            approverQueryRef.current = "";
            activeSeqRef.current += 1;
            const seq = activeSeqRef.current;

            loadedPagesByQueryRef.current.set("", new Set());
            setApproverOptions([]);
            setApproverCount(0);

            void fetchApprovers({ query: "", page: 1, replace: true, seq });
            return;
        }

        // Optional: quick local filter (instant UI)
        const local = approverOptions.filter((el) =>
            el.label.toLowerCase().includes(q)
        );
        if (local.length) {
            setApproverOptions(local);
            return;
        }

        // fallback to server search (debounced)
        debouncedSearch(q);
    };

    // pagination handler (Dropdown should pass next page)
    const loadPage = async (page: number) => {
        if (approverFetching) return;
        if (totalPages && page > totalPages) return;

        const seq = activeSeqRef.current;
        const q = approverQueryRef.current;

        void fetchApprovers({ query: q, page, replace: false, seq });
    };

    // ---------------------------
    // Keywords
    // ---------------------------
    // const handleKeySearch = (e: any) => {
    //     const val = e.target.value.toLowerCase().trim();

    //     if (!val) {
    //         setFilterdKeywords(keywordData?.data?.keywords ?? []);
    //         return;
    //     }

    //     const searched = keywordData?.data?.keywords.filter((label) =>
    //         label?.toLowerCase().includes(val)
    //     );

    //     setFilterdKeywords(searched ?? []);
    // };

    // const onSelectKeyword = (item: string, setValue: any) => {
    //     setSelectedKeys((prev) => {
    //         const next = prev.includes(item)
    //             ? prev.filter((x) => x !== item)
    //             : [...prev, item];
    //         setValue("keywords", next, { shouldValidate: true });
    //         return next;
    //     });
    // };

    // ---------------------------
    // Form
    // ---------------------------
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm<SellerFormValues>({
        resolver: zodResolver(sellerSchema),
        defaultValues: {
            name: "",
            email: "",
            dealer_code: "",
            territory_state: "",
            zip_code: "",
            // keywords: [],
            approver_ids: [],
        },
    });

    const onSubmit = async (values: any) => {
        try {
            setSubmitError("");
            await callApi({ body: values });
            navigate("/");
            reset();
        } catch (err) {
            setSubmitError(getReadableApiMessage(err));
            console.error("submit error", err);
        }
    };

    useEffect(() => {
        if (editId) {
            // console.log(state,editId,'editId')
            if (state) {
                // setSelectedKeys(state?.keywords);
                reset(state);
            } else {
                navigate("/");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state?.id]);

    // useEffect(() => {
    //     if (keywordData?.data?.keywords) {
    //         setFilterdKeywords(keywordData?.data?.keywords);
    //     }
    // }, [keywordData?.data?.keywords]);

    const GetStatesList = async () => {
        const res = await GetState(233);
        setStates(optionGenerator("name", "state_code", res));
    };

    useEffect(() => {
        void GetStatesList();
    }, []);

    const territoryStateRaw = watch("territory_state");
    const zipCodeRaw = watch("zip_code");

    const selectedStateCodes = useMemo(() => {
        const tokens = parseCsvList(territoryStateRaw);
        return Array.from(
            new Set(
                tokens
                    .map((token) => resolveStateCode(token, states))
                    .filter(Boolean) as string[]
            )
        );
    }, [territoryStateRaw, states]);

    const selectedZipCodes = useMemo(() => parseZipCodes(zipCodeRaw), [zipCodeRaw]);

    const stateZipRecordsByState = useMemo(() => {
        const grouped: Record<string, Array<{ zip: string; city?: string; state?: string }>> = {};
        selectedStateCodes.forEach((code) => {
            const items = zipcodes.lookupByState(String(code).toUpperCase()) ?? [];
            const map = new Map<string, { zip: string; city?: string; state?: string }>();
            items.forEach((item: any) => {
                const zip = String(item?.zip ?? "").trim();
                if (!zip) return;
                if (!map.has(zip)) {
                    map.set(zip, { zip, city: item?.city, state: item?.state });
                }
            });
            grouped[code] = Array.from(map.values());
        });
        return grouped;
    }, [selectedStateCodes]);

    const validZipSet = useMemo(() => {
        const set = new Set<string>();
        Object.values(stateZipRecordsByState).forEach((records) => {
            records.forEach((r) => set.add(r.zip));
        });
        return set;
    }, [stateZipRecordsByState]);

    useEffect(() => {
        const filtered = selectedZipCodes.filter((z) => validZipSet.has(z));
        if (filtered.length !== selectedZipCodes.length) {
            setValue("zip_code", filtered.join(", "), { shouldValidate: true, shouldDirty: true });
            setPendingZipCodes(filtered);
        }
    }, [selectedZipCodes, validZipSet, setValue]);

    const filteredStates = useMemo(() => {
        const q = stateSearch.trim().toLowerCase();
        if (!q) return states;
        return states.filter(
            (s) =>
                s.label.toLowerCase().includes(q) ||
                String(s.value).toLowerCase().includes(q)
        );
    }, [states, stateSearch]);

    const filteredStateZipRecordsByState = useMemo(() => {
        const q = zipSearch.trim().toLowerCase();
        if (!q) return stateZipRecordsByState;
        const grouped: Record<string, Array<{ zip: string; city?: string; state?: string }>> = {};
        Object.entries(stateZipRecordsByState).forEach(([code, records]) => {
            const next = records.filter(
                (item) =>
                    item.zip.includes(q) ||
                    String(item.city ?? "").toLowerCase().includes(q)
            );
            if (next.length) grouped[code] = next;
        });
        return grouped;
    }, [stateZipRecordsByState, zipSearch]);

    const visibleSelectedZipCodes = useMemo(
        () => (showZipPicker ? pendingZipCodes : selectedZipCodes),
        [showZipPicker, pendingZipCodes, selectedZipCodes]
    );

    if (approverLoading && !approverRefetching) {
        return <div className=" fixed bg-black-700/50 z-[999] h-screen w-screen top-0 start-0 end-0 bottom-0 flex items-center justify-center"><Spinner /></div>
    }

    return (
        <>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Seller Intake</h1>
                    <p className="text-base max-w-[470px] text-[#FEFFFFCC]">
                        Zero-noise onboarding: upload your roster or add each seller, then submit once for your org.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="bg-[#000000] border border-[#212129] sm:me-5 px-2 h-6 min-w-[104px] rounded-full text-[10px] flex items-center justify-end gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#EE2B93]"></span>
                        Zero noise intake
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => navigate("/seller/upload")}
                            className="!rounded-full bg-[#0F1627] border border-[#FFFFFF1A] w-[100px] text-center h-[30px] text-xs hover:opacity-80"
                        >
                            Upload file
                        </button>
                        <Button className="!rounded-full min-w-fit flex items-center justify-center h-[30px] text-xs">
                            Enter manually
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid lg-xl:grid-cols-2 gap-6 mt-[50px]">
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="border border-[#212129] rounded-2xl px-8 py-8 bg-dark-gradient flex flex-col gap-5">
                            <div>
                                <div className="font-semibold text-2xl text-white">Enter seller details manually</div>
                                <p className="text-base text-[#FEFFFFCC]">
                                    Add each seller one by one, save them to your intake list, then submit when you're done.
                                </p>
                            </div>

                            <div className="flex flex-col flex-1 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-base">
                                        Sales AgentName <span className="text-[#EE2B93] ps-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="eg. Alex Martinez"
                                        className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                                        {...register("name")}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-base">
                                        Email <span className="text-[#EE2B93] ps-1">*</span>
                                    </label>
                                    {editId ? (
                                        <div className="bg-[#09090E] flex items-center opacity-70 cursor-not-allowed h-14 rounded-xl px-3 border border-[#FFFFFF1A]">
                                            {watch("email")}
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="email"
                                                placeholder="e.g. alex@salespartner.com"
                                                className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                                                {...register("email")}
                                            />
                                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                                        </>
                                    )}
                                </div>

                                <div className="sm:flex items-center justify-between gap-3">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <label className="font-medium text-base">
                                            Dealer Code <span className="text-[#EE2B93] ps-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. DLR-2302"
                                            className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                                            {...register("dealer_code")}
                                        />
                                        {errors.dealer_code && (
                                            <p className="text-xs text-red-500 mt-1">{errors.dealer_code.message}</p>
                                        )}
                                    </div>

                                   
                                </div>
                                 <div className="flex flex-col gap-2 flex-1">
                                        <label className="font-medium text-base">
                                            Territory- State <span className="text-[#EE2B93] ps-1">*</span>
                                        </label>
                                        <div className="bg-[#09090E] rounded-xl px-3 py-3 border border-[#FFFFFF1A] space-y-3">
                                            {selectedStateCodes.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedStateCodes.map((code) => {
                                                        const stateObj = states.find((s) => String(s.value) === code);
                                                        return (
                                                            <button
                                                                key={code}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = selectedStateCodes.filter((s) => s !== code);
                                                                    setValue("territory_state", next.join(", "), { shouldValidate: true, shouldDirty: true });
                                                                    clearErrors("territory_state");
                                                                    setShowZipPicker(true);
                                                                }}
                                                                className="h-8 px-3 rounded-full border border-[#2E6DFF] bg-[#13213D] text-[#BFD5FF] text-xs flex items-center gap-2"
                                                            >
                                                                <span>{stateObj?.label ?? code}</span>
                                                                <span className="text-white/80">x</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                value={stateSearch}
                                                onFocus={() => setShowStatePicker(true)}
                                                onChange={(e) => {
                                                    setStateSearch(e.target.value);
                                                    setShowStatePicker(true);
                                                }}
                                                placeholder="Search and select states..."
                                                className="bg-[#0F1118] h-10 rounded-lg px-3 border border-[#FFFFFF1A] text-sm w-full"
                                            />
                                            {showStatePicker && (
                                                <div className="max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                                                    {filteredStates.map((item) => {
                                                        const code = String(item.value);
                                                        const isSelected = selectedStateCodes.includes(code);
                                                        return (
                                                            <button
                                                                key={code}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = isSelected
                                                                        ? selectedStateCodes.filter((s) => s !== code)
                                                                        : [...selectedStateCodes, code];
                                                                    setValue("territory_state", Array.from(new Set(next)).join(", "), { shouldValidate: true, shouldDirty: true });
                                                                    clearErrors("territory_state");
                                                                    setShowZipPicker(true);
                                                                }}
                                                                className={clsx(
                                                                    "h-10 px-3 rounded-lg border text-sm flex items-center justify-between",
                                                                    isSelected
                                                                        ? "border-[#00C950] bg-[#0D2A1A] text-[#9CF5C2]"
                                                                        : "border-[#FFFFFF2E] text-white hover:border-[#FFFFFF80]"
                                                                )}
                                                            >
                                                                <span className="truncate">{item.label}</span>
                                                                <span className="text-xs opacity-80">{code}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {errors.territory_state && (
                                            <p className="text-xs text-red-500 mt-1">{errors.territory_state.message}</p>
                                        )}
                                    </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-base">
                                        Zip Code <span className="text-[#EE2B93] ps-1">*</span>
                                    </label>
                                    <div className="bg-[#09090E] rounded-xl px-3 py-3 border border-[#FFFFFF1A]">
                                        {!selectedStateCodes.length ? (
                                            <div className="text-sm text-[#FFFFFF99]">Select at least one state first</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {visibleSelectedZipCodes.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {visibleSelectedZipCodes.map((zip) => (
                                                            <button
                                                                key={zip}
                                                                type="button"
                                                                onClick={() => {
                                                                    const next = visibleSelectedZipCodes.filter((z) => z !== zip);
                                                                    setPendingZipCodes(next);
                                                                    setValue("zip_code", next.join(", "), { shouldValidate: true, shouldDirty: true });
                                                                    clearErrors("zip_code");
                                                                }}
                                                                className="h-8 px-3 rounded-full border border-[#00C950] bg-[#0D2A1A] text-[#9CF5C2] text-xs flex items-center gap-2"
                                                            >
                                                                <span>{zip}</span>
                                                                <span className="text-white/80">x</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <input
                                                    type="text"
                                                    value={zipCodeRaw ?? ""}
                                                    onFocus={() => {
                                                        setPendingZipCodes(parseZipCodes(String(zipCodeRaw ?? "")));
                                                        setShowZipPicker(true);
                                                    }}
                                                    onChange={(e) => {
                                                        const cleaned = e.target.value.replace(/[^\d,\s-]/g, "").slice(0, 500);
                                                        setValue("zip_code", cleaned, { shouldValidate: true, shouldDirty: true });
                                                        setPendingZipCodes(parseZipCodes(cleaned));
                                                        clearErrors("zip_code");
                                                        setShowZipPicker(true);
                                                    }}
                                                    placeholder="Selected ZIPs..."
                                                    className="bg-[#0F1118] h-10 rounded-lg px-3 border border-[#FFFFFF1A] text-sm w-full"
                                                />
                                                {showZipPicker && (
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            value={zipSearch}
                                                            onChange={(e) => setZipSearch(e.target.value.replace(/[^\d\sA-Za-z-]/g, ""))}
                                                            placeholder="Search ZIP by code or city..."
                                                            className="bg-[#0F1118] h-10 rounded-lg px-3 border border-[#FFFFFF1A] text-sm w-full"
                                                        />

                                                        <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
                                                            {selectedStateCodes.map((code) => {
                                                                const records = filteredStateZipRecordsByState[code] ?? [];
                                                                const stateObj = states.find((s) => String(s.value) === code);
                                                                if (!records.length) return null;
                                                                const stateZips = (stateZipRecordsByState[code] ?? []).map((r) => r.zip);
                                                                const isAllSelected = stateZips.length > 0 && stateZips.every((z) => pendingZipCodes.includes(z));

                                                                return (
                                                                    <div key={code} className="rounded-xl border border-[#FFFFFF1A] p-3 space-y-3">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <div className="text-sm font-medium">
                                                                                {stateObj?.label ?? code}
                                                                                <span className="text-xs text-[#FFFFFF80] ms-2">({code})</span>
                                                                                {isAllSelected && (
                                                                                    <span className="text-[10px] ms-2 px-2 py-0.5 rounded-full border border-[#00C950] text-[#9CF5C2]">Fully selected</span>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setPendingZipCodes((prev) => {
                                                                                        if (isAllSelected) {
                                                                                            const stateSet = new Set(stateZips);
                                                                                            return prev.filter((z) => !stateSet.has(z));
                                                                                        }
                                                                                        return Array.from(new Set([...prev, ...stateZips]));
                                                                                    });
                                                                                }}
                                                                                className="h-8 px-3 rounded-lg border border-[#FFFFFF2E] text-xs hover:border-[#FFFFFF80] duration-300"
                                                                            >
                                                                                {isAllSelected ? "Unselect All" : "Select All Zip Codes"}
                                                                            </button>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                            {records.map((item) => {
                                                                                const isSelected = pendingZipCodes.includes(item.zip);
                                                                                return (
                                                                                    <button
                                                                                        key={`${code}-${item.zip}`}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setPendingZipCodes((prev) =>
                                                                                                prev.includes(item.zip)
                                                                                                    ? prev.filter((z) => z !== item.zip)
                                                                                                    : [...prev, item.zip]
                                                                                            );
                                                                                        }}
                                                                                        className={clsx(
                                                                                            "h-11 rounded-lg px-3 text-sm border duration-300 flex items-center justify-between gap-2",
                                                                                            isSelected
                                                                                                ? "border-[#00C950] bg-[#0D2A1A] text-[#9CF5C2]"
                                                                                                : "border-[#FFFFFF2E] text-white hover:border-[#FFFFFF80]"
                                                                                        )}
                                                                                    >
                                                                                        <span>{item.zip}</span>
                                                                                        <span className="text-[11px] text-[#FFFFFFB2] truncate">{item.city}, {item.state}</span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="text-xs text-[#FFFFFFA3]">{pendingZipCodes.length} ZIP selected</div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setValue("zip_code", Array.from(new Set(pendingZipCodes)).join(", "), { shouldValidate: true, shouldDirty: true });
                                                                    clearErrors("zip_code");
                                                                    setZipSearch("");
                                                                    setShowZipPicker(false);
                                                                }}
                                                                className={clsx(
                                                                    "h-9 px-4 rounded-lg text-sm border duration-300",
                                                                    pendingZipCodes.length
                                                                        ? "border-[#00C950] bg-[#0D2A1A] text-[#9CF5C2] hover:opacity-80"
                                                                        : "border-[#FFFFFF2E] text-[#FFFFFF80] cursor-not-allowed"
                                                                )}
                                                                disabled={pendingZipCodes.length === 0}
                                                            >
                                                                Save Selection
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.zip_code && selectedZipCodes.length === 0 && <p className="text-xs text-red-500 mt-1">{errors.zip_code.message}</p>}
                                </div>
                            </div>

                            {/* Keywords */}
                            {/* <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <label className="font-medium text-base">
                                            Keywords <span className="text-[#EE2B93] ps-1">*</span>
                                        </label>
                                        <p>Select the primary buyer signals VelocityIQ should map to this seller.</p>
                                    </div>

                                    <div className={clsx("flex items-center bg-[#09090E] h-14 rounded-xl px-3 gap-2 border border-[#FFFFFF1A]")}>
                                        <span className={clsx("opacity-60 md:block hidden")}>
                                            <Icon name="search" />
                                        </span>
                                        <input
                                            onChange={handleKeySearch}
                                            type="text"
                                            placeholder="Search Keyword..."
                                            className={clsx("bg-transparent outline-none flex-1 text-white")}
                                        />
                                    </div>

                                    {errors.keywords && <p className="text-xs text-red-500 mt-1">{errors.keywords.message}</p>}
                                </div>

                                <div>
                                    {filterdKeywords.length ? (
                                        filterdKeywords.map((label) => (
                                            <button
                                                onClick={() => onSelectKeyword(label, setValue)}
                                                type="button"
                                                key={label}
                                                className={clsx(
                                                    "my-2 mx-1 rounded-full px-3 py-1 border border-[#EE2B93] text-[#FFFFFF80] hover:bg-[#EE2B934D] hover:text-white hover:border-[#EE2B934D] duration-300",
                                                    selectedKeys.includes(label) ? "bg-[#EE2B934D] text-white" : ""
                                                )}
                                            >
                                                {label}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center font-semibold">Keywords not found</div>
                                    )}
                                </div>
                            </div> */}

                            {/* Approvers */}
                            <div>
                                <div className="font-semibold text-lg mb-4">Saved Sellers</div>
                                <label className="font-medium text-base mb-2 block">Add Approvers</label>

                                <Controller
                                    name="approver_ids"
                                    control={control}
                                    render={({ field }) => (
                                        <Dropdown
                                            isFetchingMore={approverFetching}
                                            totalPages={totalPages}
                                            onReachBottom={loadPage} // Dropdown should pass next page number
                                            isSearch={true}
                                            onChange={handleApproverSearch}
                                            showSelectedList
                                            multiple
                                            options={approverOptions}
                                            value={field.value}
                                            onSelect={(val) => field.onChange(val as number[])}
                                            placeholder="Select approvers"
                                            classNames={{
                                                trigger: "!bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]",
                                                selectedOption: "bg-blue-gradient",
                                            }}
                                        />
                                    )}
                                />
                            </div>
                              {submitError && (
                            <div className="mt-4 rounded-xl border border-[#FB2C36]/40 bg-[#2A0F14] px-4 py-3 text-sm text-[#FFB4BE]">
                                {submitError}
                            </div>
                        )}
                        </div>

                        <div className="lg-xl:flex items-center mt-10 gap-10">
                            <Button className="!rounded-full" type="submit" isLoading={isLoading}>
                                {state ? "Update" : "Submit intake"}
                            </Button>
                            <p className="flex lg-xl:whitespace-nowrap text-[#FEFFFFCC] text-base lg-xl:pt-0 pt-5">
                                <span className="font-semibold text-white pe-1 whitespace-nowrap">Heads up:</span>
                                by submitting, you’re authorizing VelocityIQ to onboard these details into your workspace.
                            </p>
                        </div>
                      
                    </form>
                </div>

                <div className="text-[#FEFFFFCC] lg-xl:order-1 -order-1 text-base border border-[#212129] rounded-2xl px-8 py-8 bg-dark-gradient flex flex-col gap-5 h-fit">
                    <div>
                        <div className="font-semibold text-2xl text-white">What happens next?</div>
                        <p>Add each seller one by one, save them to your intake list, then submit when you're done.</p>
                    </div>
                    <ul className="list-disc ps-4">
                        <li>We’ll confirm seller identity and dealer code against your agreement.</li>
                        <li>Territory (state + ZIPs) helps route the right buyer Signals and opportunities.</li>
                        <li>Signals help VelocityIQ prioritize who to surface first in your sellers’ day.</li>
                        <li>No passwords or sensitive credentials are collected on this page.</li>
                    </ul>
                    <div>Have a large team? Use Upload file. Adding a handful today? Use Enter manually and save each seller before submitting.</div>
                </div>
            </div>
        </>
    );
};

export default AddSeller;
