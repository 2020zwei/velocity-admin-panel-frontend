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

const AddSeller = () => {
    // const [filterdKeywords, setFilterdKeywords] = useState<string[]>([]);
    // const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const { state, search } = useLocation();
    const [states, setStates] = useState<Option[]>([]);
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
        url: editId ? `/sales-reps/${editId}` : "/sales-reps/invite/",
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
                    url: "/approvers",
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
            await callApi({ body: values });
            navigate("/");
            reset();
        } catch (err) {
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

                                    <div className="flex flex-col gap-2 flex-1">
                                        <label className="font-medium text-base">
                                            Territory- State <span className="text-[#EE2B93] ps-1">*</span>
                                        </label>

                                        <Controller
                                            name="territory_state"
                                            control={control}
                                            render={({ field }) => (
                                                <Dropdown
                                                    options={states}
                                                    isSearch={true}
                                                    value={states.find((s) => s.value === field.value)}
                                                    onSelect={(item) => {
                                                        if (!Array.isArray(item)) field.onChange(item.value);
                                                    }}
                                                    placeholder="Select territory"
                                                    classNames={{
                                                        trigger: "!bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]",
                                                        selectedOption: "bg-blue-gradient",
                                                    }}
                                                />
                                            )}
                                        />

                                        {errors.territory_state && (
                                            <p className="text-xs text-red-500 mt-1">{errors.territory_state.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="font-medium text-base">
                                        Zip Code <span className="text-[#EE2B93] ps-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter comma-separated ZIP codes...."
                                        className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                                        {...register("zip_code")}
                                    />
                                    {errors.zip_code && <p className="text-xs text-red-500 mt-1">{errors.zip_code.message}</p>}
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
