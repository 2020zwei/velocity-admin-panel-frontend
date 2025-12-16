import { Button } from '@/components/Button'
import Dropdown, { type Option } from '@/components/Dropdown'
import Icon from '@/components/Icon'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useApi } from '@/hooks/useApi'
import Spinner from '@/components/Spinner'
import { GetState } from "react-country-state-city";

const sellerSchema = z.object({
    name: z
        .string()
        .min(1, "Sales Agent Name is required"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
    dealer_code: z
        .string()
        .min(1, "Dealer Code is required"),
    territory_state: z
        .string()
        .min(1, "Territory - State is required"),
    zip_code: z
        .string()
        .min(1, "Zip Code is required"),
    keywords: z
        .array(z.string())
        .min(1, "Select at least one keyword"),
    approver_ids: z
        .array(z.number())
})

type SellerFormValues = z.infer<typeof sellerSchema>

const AddSeller = () => {
    const [filterdKeywords, setFilterdKeywords] = useState<string[]>([])
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const { state, search } = useLocation();
    const [states, setStates] = useState<Option[]>([])

    const editId = search.slice(search.lastIndexOf("=") + 1)



    const { data, isLoading: approverLoading } = useApi<{ results: { data: { approvers: any[] } } }>({
        url: `/approvers`,
        auto: true,
        method: "get",
        transformResponse: (d) => d
    });

    const { data: keywordData, isLoading: isKeywordLoading } = useApi<{ data: { keywords: any[] } }>({
        url: `/keywords`,
        auto: true,
        method: "get",
        transformResponse: (d) => d
    });


    const { isLoading, refetch: callApi } = useApi<{ results: any[] }>({
        url: editId ? `/sales-reps/${editId}` : "/sales-reps/invite/",
        method: state?.id ? "patch" : "post",
        auto: false,
        transformResponse: (d) => d,
    });
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        setValue,
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
            keywords: [],
            approver_ids: [],
        },
    })

    const handleKeySearch = (e: any) => {
        const val = e.target.value.toLowerCase().trim();

        if (!val) {
            setFilterdKeywords(keywordData?.data?.keywords ?? []);
            return;
        }

        const searched = keywordData?.data?.keywords.filter((lable) =>
            lable?.toLowerCase().includes(val)
        );

        setFilterdKeywords(searched ?? []);
    };


    const onSelect = (item: any) => {
        const found = selectedKeys.includes(item)
        if (found) {
            const filtered = selectedKeys.filter((label: string) => label !== item)
            setSelectedKeys(filtered)
            setValue("keywords", filtered, { shouldValidate: true })
        }
        else {
            const updated = [...selectedKeys, item]
            setSelectedKeys((prev: string[]) => [...prev, item])
            setValue("keywords", updated, { shouldValidate: true })
        }
    }

    const hasMore=()=>{
        console.log("sdffdssd")
    }

    const onSubmit = async (values: any) => {
        try {
            await callApi({ body: values });
            navigate("/")
            reset();
        } catch (err) {
            console.error("submit error", err);
        }
    };

    useEffect(() => {
        if (editId) {
            if (state) {
                setSelectedKeys(state?.keywords)
                reset(state)
            }
            else {
                navigate("/")
            }
        }
    }, [state?.id])

    useEffect(() => {
        if (keywordData?.data?.keywords) {
            setFilterdKeywords(keywordData?.data?.keywords)
        }
    }, [keywordData?.data?.keywords])


    const GetStates = async () => {
        const res = await await GetState(233);
        const data: any = res.map((el) => ({ lable: el.name, value: el.state_code }))
        setStates(data)
    }

    useEffect(() => {
        GetStates()
    }, []);
    if (approverLoading || isKeywordLoading) {
        return <Spinner />
    }
    const approvers: Option[] = data?.results?.data?.approvers?.map((el) => ({ lable: el.name, value: el.id })) ?? []


    return (
        <>
            <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                <div>
                    <h1 className="text-2xl font-semibold">Seller Intake</h1>
                    <p className='text-base max-w-[470px] text-[#FEFFFFCC]'>Zero-noise onboarding: upload your roster or add each seller, then submit once for your org.</p>
                </div>
                <div className='flex items-center justify-between gap-3'>
                    <div className='bg-[#000000] border border-[#212129] sm:me-5 px-2 h-6 min-w-[104px] rounded-full text-[10px] flex items-center justify-end gap-2'>
                        <span className='w-2 h-2 rounded-full bg-[#EE2B93]'></span>
                        Zero noise intake
                    </div>
                    <div className='flex items-center gap-1'>
                        <button type='button' onClick={() => navigate('/seller/upload')} className='!rounded-full bg-[#0F1627] border border-[#FFFFFF1A] w-[100px] text-center h-[30px] text-xs hover:opacity-80'>
                            Upload file
                        </button>
                        <Button className='!rounded-full min-w-fit flex items-center justify-center h-[30px] text-xs'>
                            Enter manually
                        </Button>
                    </div>
                </div>
            </div>

            <div className=' grid lg-xl:grid-cols-2 gap-6 mt-[50px]'>
                <div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='border border-[#212129] rounded-2xl px-8 py-8 bg-dark-gradient flex flex-col gap-5'>
                            <div>
                                <div className='font-semibold text-2xl text-white'>Enter seller details manually</div>
                                <p className='text-base text-[#FEFFFFCC]'>Add each seller one by one, save them to your intake list, then submit when you're done.</p>
                            </div>
                            <div className='flex flex-col flex-1 gap-5'>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="" className=' font-medium text-base'>
                                        Sales AgentName
                                        <span className='text-[#EE2B93] ps-1'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='eg. Alex Martinez'
                                        className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]'
                                        {...register("name")}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="" className=' font-medium text-base'>
                                        Email
                                        <span className='text-[#EE2B93] ps-1'>*</span>
                                    </label>
                                    {(editId) ? <div className="bg-[#09090E] flex items-center opacity-70 cursor-not-allowed h-14 rounded-xl px-3 border border-[#FFFFFF1A]">{watch("email")}</div> :
                                        <>
                                            <input
                                                type="email"
                                                placeholder='e.g. alex@salespartner.com'
                                                className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]'
                                                {...register("email")}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </>}
                                </div>
                                <div className='sm:flex items-center justify-between gap-3'>
                                    <div className='flex flex-col gap-2 flex-1'>
                                        <label htmlFor="" className=' font-medium text-base'>
                                            Dealer Code
                                            <span className='text-[#EE2B93] ps-1'>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder='e.g. DLR-2302'
                                            className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]'
                                            {...register("dealer_code")}
                                        />
                                        {errors.dealer_code && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.dealer_code.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-2 flex-1'>
                                        <label htmlFor="" className=' font-medium text-base'>
                                            Territory- State
                                            <span className='text-[#EE2B93] ps-1'>*</span>
                                        </label>
                                        <Controller
                                            name="territory_state"
                                            control={control}
                                            render={({ field }) => (
                                                <Dropdown
                                                    options={states}
                                                     onReachBottom={hasMore}
                                                    value={
                                                        states.find((s) => s.value === field.value)
                                                    }
                                                    onSelect={(item) => {
                                                        if (!Array.isArray(item)) {
                                                            field.onChange(item.value);
                                                        }
                                                    }}
                                                    placeholder="Select territory"
                                                    classNames={{
                                                        trigger:
                                                            "!bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]",
                                                        selectedOption: "bg-blue-gradient",
                                                    }}
                                                />
                                            )}
                                        />

                                        {errors.territory_state && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.territory_state.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="" className=' font-medium text-base'>
                                        Zip Code
                                        <span className='text-[#EE2B93] ps-1'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='Enter comma-separated ZIP codes....'
                                        className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]'
                                        {...register("zip_code")}
                                    />
                                    {errors.zip_code && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.zip_code.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className='flex flex-col gap-5'>
                                <div className='flex flex-col gap-2'>
                                    <div>
                                        <label className=' font-medium text-base'>
                                            Keywords
                                            <span className='text-[#EE2B93] ps-1'>*</span>
                                        </label>
                                        <p>Select the primary buyer signals VelocityIQ should map to this seller.</p>
                                    </div>
                                    <div className={clsx("flex items-center bg-[#09090E] h-14 rounded-xl px-3 gap-2 border border-[#FFFFFF1A]")}>
                                        <span className={clsx("opacity-60 md:block hidden")}><Icon name='search' /></span>
                                        <input
                                            onChange={handleKeySearch}
                                            type="text"
                                            placeholder="Search Keyword..."
                                            className={clsx("bg-transparent outline-none flex-1 text-white")}
                                        />

                                    </div>
                                    {errors.keywords && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.keywords.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {filterdKeywords.length ? filterdKeywords.map((lable) => (
                                        <button
                                            onClick={() => onSelect(lable)}
                                            type='button'
                                            key={lable}
                                            className={clsx(
                                                'my-2 mx-1 rounded-full px-3 py-1 border border-[#EE2B93] text-[#FFFFFF80] hover:bg-[#EE2B934D] hover:text-white hover:border-[#EE2B934D] duration-300',
                                                selectedKeys.includes(lable) ? "bg-[#EE2B934D] text-white" : ""
                                            )}
                                        >
                                            {lable}
                                        </button>
                                    )) : <div className='text-center font-semibold'>Keywords not found</div>}

                                </div>
                            </div>

                            <div>
                                <div className='font-semibold text-lg mb-4'>Saved Sellers</div>
                                <label htmlFor="" className='font-medium text-base mb-2 block'>
                                    Add Approvers
                                </label>

                                <Controller
                                    name="approver_ids"
                                    control={control}
                                    render={({ field }) => (
                                        <Dropdown
                                            multiple
                                            options={approvers}
                                            value={field.value}
                                            onSelect={(val) => field.onChange(val as string[])}
                                            classNames={{
                                                trigger: "!bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]",
                                                selectedOption: "bg-blue-gradient"
                                            }}
                                            
                                        />
                                    )}
                                />
                            </div>


                        </div>
                        <div className='lg-xl:flex items-center mt-10 gap-10'>
                            <Button className='!rounded-full' type="submit"
                                isLoading={isLoading}
                            >
                                {state ? "Update" : "Submit intake"}
                            </Button>
                            <p className='flex lg-xl:whitespace-nowrap text-[#FEFFFFCC] text-base lg-xl:pt-0 pt-5'>
                                <span className=' font-semibold text-white pe-1 whitespace-nowrap'>Heads up:</span>
                                by submitting, you’re authorizing VelocityIQ to onboard these details into your workspace.
                            </p>
                        </div>
                    </form>
                </div>


                <div className='text-[#FEFFFFCC] lg-xl:order-1 -order-1 text-base border border-[#212129] rounded-2xl px-8 py-8 bg-dark-gradient flex flex-col gap-5 h-fit'>

                    <div>
                        <div className='font-semibold text-2xl text-white'>What happens next?</div>
                        <p>Add each seller one by one, save them to your intake list, then submit when you're done.</p>
                    </div>
                    <ul className='list-disc ps-4'>
                        <li>We’ll confirm seller identity and dealer code against your agreement.</li>
                        <li>Territory (state + ZIPs) helps route the right buyer Signals and opportunities.</li>
                        <li>Signals help VelocityIQ prioritize who to surface first in your sellers’ day.</li>
                        <li>No passwords or sensitive credentials are collected on this page.</li>
                    </ul>
                    <div>Have a large team? Use Upload file. Adding a handful today? Use Enter manually and save each seller before submitting.</div>
                </div>
            </div>
        </>
    )
}

export default AddSeller
