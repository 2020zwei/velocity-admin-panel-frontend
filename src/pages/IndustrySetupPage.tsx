import clsx from 'clsx';
import React, { useEffect, useState, type ChangeEvent } from 'react';
import { Button as CustomButton } from "@/components/Button";
import { useApi } from '@/hooks/useApi';
import Spinner from '@/components/Spinner';
import Icon from '@/components/Icon';
import CompetirorForm, { type FormValues } from '@/components/CompetirorForm';
import EditCompititorModal from '@/components/EditCompititorModal';
import DeleteModal from '@/components/DeleteModal';
import { Link } from 'react-router-dom';
import { ShimmerRow, ShimmerWave } from '@/components/TableShimmerRow';
const classNames = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');
type ButtonVariant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

interface PanelProps {
    title?: string;
    subtitle?: string;
    className?: string;
    children?: React.ReactNode;
    subTitleClass?: string
}


interface TagProps {
    children: React.ReactNode;
    small?: boolean;
    active?: boolean;
    className?: string
}


interface Industry {
    id: number;
    name: string;
    description?: string;
}

interface Keyword {
    id: number;
    text: string;
    intent: 'High' | 'Mid' | 'Low' | string;
}

interface SuggestedCompetitor {
    id: number;
    competitor_name: string;
    competitor_website?: string;
    competitor_location?: string;
}

interface SelectedCompetitor extends SuggestedCompetitor {
    id: number;
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...rest }) => {
    const base = 'px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 duration-300';
    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-pink-500 hover:opacity-90 text-white',
        ghost: 'bg-[#0F1627] border border-[#FFFFFF1A] text-sm text-white',
        outline: 'border border-[#F14190] bg-transparent text-sm text-white',
    };
    return (
        <button className={classNames(base, variants[variant], className)} {...rest}>
            {children}
        </button>
    );
};

const Panel: React.FC<PanelProps> = ({ title, subtitle, className, children, subTitleClass }) => (
    <div className={classNames(className)}>
        {(title || subtitle) && (
            <div className="mb-4">
                {title && <div className="text-lg font-semibold text-white">{title}</div>}
                {subtitle && <div className={clsx("text-sm text-[#FFFFFFB2] mt-1", subTitleClass)}>{subtitle}</div>}
            </div>
        )}
        {children}
    </div>
);

const Tag: React.FC<TagProps> = ({ children, small, active, className }) => (
    <span
        className={classNames(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
            small ? 'py-0.5 px-2 text-[11px]' : '',
            active ? 'bg-[#0F2F2A] text-green-400 border border-green-700' : 'bg-[#0F1627] text-white border border-[#FFFFFF1A]',
            className
        )}
    >
        {children}
    </span>
);



/* ----------------------------- IndustrySetupPage ---------------------------- */
const IndustrySetupPage: React.FC = () => {
    // industrySearch
    const [competitorEditModal, setCompetitorEditModal] = useState<any>("")
    const [deleteItem, setDeleteItem] = useState<any>("")
    const [industrySearch, setIndustrySearch] = useState<string>();
    const [filteredIndustry, setFilteredIndustry] = useState<Industry[]>();
    // end industrySearch
    const [chosenKeywords, setChosenKeywords] = useState<Array<Keyword & { active?: boolean }>>([]);
    // const [keywordSearch, setKeywordSearch] = useState<string>('');
    const [selectedCompetitors, setSelectedCompetitors] = useState<SelectedCompetitor[]>([]);

    const [zip, setZip] = useState<string>('33065');
    // setSuggestions
    const [suggestionSearch, setSuggestionSearch] = useState<string>('');
    const [suggestions, setSuggestions] = useState<SuggestedCompetitor[]>([]);
    // end setSuggestions
    // fetch keywords
    const {
        isLoading: postLoading,
        refetch: postData,
    } = useApi<any>({
        url: "/admin/industry-keywords/",
        method: "post",
        auto: false,
    });
    const {
        isLoading: cLoading,
        refetch: postCompetitors,
    } = useApi<any>({
        url: competitorEditModal ? `/admin/competitors/${competitorEditModal?.id}/` : '/admin/competitors/',
        method: competitorEditModal ? "patch" : "post",
        auto: false,
    });

    const {
        data: competitorData,
        isLoading: cGetLoading,
        refetch: refetchCompetitor,
        isRefetching,
    } = useApi<any>({
        url: "/admin/competitors/",
    });

    // fetch keywords
    const {
        data: filteredKeywordData,
        isLoading: keywordLoading,
    } = useApi<any>({
        url: "/admin/keywords/",
    });
    // end fetch keywords

    // fetch keywords
    const {
        data: selectedData,
        isLoading: selectedLoading,
    } = useApi<any>({
        url: "/admin/industry-keywords/",
    });
    // end fetch keywords


    // fetch industries
    const {
        data: industryData,
        isLoading: industryLoading,
    } = useApi<any>({
        url: "/admin/industries/",
    });
    // end fetch industries
    const industries = industryData?.results?.data?.industries

    useEffect(() => {
        if (industries && !industryLoading) {
            setIndustrySearch(industries?.[0].name)
            setFilteredIndustry(industries)
        }
    }, [industries, industryLoading])

    useEffect(() => {
        if (selectedData?.data?.selection?.keywords?.length) {
            setChosenKeywords(selectedData?.data?.selection?.keywords)
        }
    }, [selectedData?.data?.selection?.keywords, selectedLoading])



    const keyworeds = filteredKeywordData?.results?.data?.keywords ?? []


    // const filteredKeywords = useMemo<Keyword[]>(() => {
    //     if (!keywordSearch) return keyworeds;
    //     return [...keyworeds].filter((k: any) => k.keyword.toLowerCase().includes(keywordSearch.toLowerCase()));
    // }, [keyworeds, keywordSearch]);


    const handleAddKeyword = (kw: Keyword) => {
        const exists = chosenKeywords.some(k => k.id === kw.id);
        if (exists) {
            // REMOVE
            setChosenKeywords(prev =>
                prev.filter(k => k.id !== kw.id)
            );
        } else {
            // ADD (limit 8)
            if (chosenKeywords.length >= 8) return;

            setChosenKeywords(prev => [
                ...prev,
                { ...kw, active: true }
            ]);
        }
    };


    const handleRemoveKeyword = (id: number) => setChosenKeywords((s) => s.filter((k) => k.id !== id));

    const handleToggleKeywordActive = (id: number) => {
        setChosenKeywords((s) => s.map((k) => (k.id === id ? { ...k, active: !k.active } : k)));
    };



    const handleAddCompetitor = (
        c: { id?: number; competitor_name: string; competitor_website?: string; competitor_location?: string }
    ) => {
        const id: any = c.id ?? c.competitor_name; // fallback key

        const exists = selectedCompetitors.some(comp => comp.id === id);

        if (exists) {
            // REMOVE competitor
            setSelectedCompetitors(prev =>
                prev.filter(comp => comp.id !== id)
            );
        } else {
            // ADD competitor (limit 3)
            if (selectedCompetitors.length >= 3) return;

            const newCompetitor: SelectedCompetitor = {
                ...c,
                id
            };

            setSelectedCompetitors(prev => [...prev, newCompetitor]);
        }
    };


    const handleRemoveCompetitor = (id?: number) => {
        setSelectedCompetitors((s) => s.filter((c) => c.id !== id));
    };


    const handleIndustrySearch = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setIndustrySearch(value);

        if (!value.trim()) {
            setFilteredIndustry(industries);
            return;
        }

        setFilteredIndustry(
            industries.filter((ind: Industry) =>
                ind.name.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handleSuggestionSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSuggestionSearch(value);

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        setSuggestions(
            [].filter((ind) =>
                // @ts-ignore
                ind?.competitor_name?.toLowerCase().includes(value.toLowerCase())
            )
        );
    };


    const submit = async (data: FormValues) => {
        await postCompetitors({ body: data })
        await refetchCompetitor()
        if (competitorEditModal?.id) {
            setCompetitorEditModal("")
        }
    };
    const onDeleteConfirm = async () => {
        await refetchCompetitor()
        setDeleteItem("")
    }
    const handleSave = async () => {
        const keyIds = chosenKeywords.map((item) => item.id)
        const inId = industries.find((el: Industry) => el.id)?.id
        await postData({ body: { industry_id: inId, keyword_ids: keyIds } });
    }
    // if ((keywordLoading || industryLoading || selectedLoading || cGetLoading) && !isRefetching) {
    //     return <div className=" fixed bg-black-700/50 z-[999] h-screen w-screen top-0 start-0 end-0 bottom-0 flex items-center justify-center"><Spinner /></div>
    // }

    const showSkeleton = keywordLoading || industryLoading || selectedLoading || cGetLoading || isRefetching

    return (
        <div className="min-h-screen text-white">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex mb-6 flex-col">
                    <div className='max-w-[680px]'>
                        <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2"> <span className='bg-[#00C950] w-3 h-3 rounded-full'></span> Industry Setup . Intent & Competitors</h2>
                        <p className="text-sm text-[#FFFFFFB2] mt-2">Admin View: Choose an Industry, Select Up To Five Keywords For Intent Signals. Then Pick Up To Three Local Competitors With Websites For ProposalIQ.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-5 mb-3">
                        <div className="rounded-full bg-[#1B1A25] border border-[#FFFFFF1A] px-4 py-2 text-xs">STEP 1 - CHOOSE INDUSTRY</div>
                        <div className="rounded-full bg-[#1B1A25] border border-[#FFFFFF1A] px-4 py-2 text-xs">STEP 2 - PICK KEYWORDS (MAX 8)</div>
                        <div className="rounded-full bg-[#1B1A25] border border-[#FFFFFF1A] px-4 py-2 text-xs">STEP 3 - ADD LOCAL COMPETITORS (MAX 3)</div>
                    </div>
                </div>

                {/* top panels */}
                <div className='bg-[#131219] border border-[#212129] p-4 rounded-2xl flex flex-col gap-5'>
                    <div>
                        <h2 className='text-lg font-semibold text-white'>Industry & Intent keywords</h2>
                        <p className='text-sm text-[#FFFFFFB2] mt-1'>Pick the customer's industry, then select up to five keywords that describe how they operate. These drive VelociIQ intent signals.</p>
                    </div>
                    <div className="flex lg-xl:gap-9 md:gap-5 gap-4">
                        {/* industry list */}
                        <div className="flex-1">
                            <Panel>
                                <div className="space-y-3">
                                    <div className="text-sm text-[#FFFFFFB2] pt-2">{!selectedData?.data?.selection?.industry?.id ? 'SEARCH INDUSTRIES' : 'SELECTED INDUSTRY'}</div>
                                    {!selectedData?.data?.selection?.industry?.id &&
                                        <input value={industrySearch} onChange={handleIndustrySearch} className="w-full bg-[#08080C] h-12 rounded-xl px-3 border border-[#FFFFFF1A] text-sm text-white" placeholder="e.g. HVAC, Wireless, Transportation..." />}
                                    <div className="mt-3 space-y-4">
                                        {showSkeleton ? (
                                            Array.from({ length: 5 }).map((_, i) => <ShimmerWave key={`shim1-${i}`}/>)
                                        ) :
                                            filteredIndustry?.map((ind: Industry) => (
                                                selectedData?.data?.selection?.industry?.id ?
                                                    <div
                                                        className={classNames(
                                                            'w-full text-left p-3 rounded-xl flex flex-col gap-1 cursor-default',
                                                            ind?.id === selectedData?.data?.selection?.industry?.id
                                                                ? 'gradient-border text-white'
                                                                : 'border border-[#FFFFFF1A] opacity-70'
                                                        )}
                                                    >{ind.name}</div>
                                                    :
                                                    <button
                                                        key={ind.id}
                                                        onClick={() => {
                                                            setIndustrySearch(ind.name);
                                                            setFilteredIndustry(industries);
                                                        }}
                                                        className={classNames(
                                                            'w-full text-left p-3 rounded-xl flex flex-col gap-1 hover:opacity-70 duration-300',
                                                            industrySearch === ind.name
                                                                ? 'gradient-border text-white'
                                                                : 'border border-[#FFFFFF1A]'
                                                        )}
                                                    >
                                                        <div className="text-sm">{ind.name}</div>
                                                        <div className="text-xs text-[#FFFFFFB2]">{ind.description}</div>
                                                    </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* keyword library */}
                        <div className="max-w-[460px]">
                            <Panel title="Industry keyword library" subTitleClass='max-w-[270px]' subtitle="Choose keywords to add to your selection. HVAC SERVICE KEYWORDS">
                                {showSkeleton ? (
                                    Array.from({ length: 5 }).map((_, i) => <ShimmerWave key={`shim2-${i}`}/>)
                                ) :
                                    <>
                                        <div className="grid gap-4">
                                            {keyworeds.map((kw: any) => {
                                                return (
                                                    <div key={kw.id} className="flex items-center text-[#FFFFFF] font-normal justify-between gap-4 p-3 rounded-xl border border-[#FFFFFF1A]">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="text-sm truncate">{kw.keyword}</div>
                                                            {/* active={kw.intent === 'High'} */}
                                                            <Tag small className={clsx('!py-0 h-6', kw.intent_level?.toLowerCase()?.trim() === 'high' ? '!border-[#00A63E]' : '!border-[#FEAC48]')}>{kw?.intent_level}</Tag>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                className={clsx(
                                                                    '!py-0 h-6 min-w-[60px] text-[10px]',
                                                                    chosenKeywords.some((c) => c.id === kw.id)
                                                                        ? '!border-[#00A63E]'
                                                                        : '!border-[#FFFFFFB2]'
                                                                )}
                                                                variant={chosenKeywords.some((c) => c.id === kw.id) ? 'ghost' : 'outline'}
                                                                onClick={() => {
                                                                    if (chosenKeywords.some((c) => c.id === kw.id)) return;
                                                                    if (chosenKeywords.length >= 8) {
                                                                        return;
                                                                    }
                                                                    handleAddKeyword(kw);
                                                                }}
                                                            >
                                                                {chosenKeywords.some((c) => c.id === kw.id) ? 'Added' : 'Add'}
                                                            </Button>

                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className='text-sm text-[#FFFFFFB2] py-4 border-b border-[#FFFFFF1A]'>
                                            Keywords here are tailored to that industry (AC system, carriers, student tablets, etc.). Click "Add" to send them to your chosen list.
                                        </div>
                                        <div className='flex items-center gap-3 justify-end mt-4'>
                                            <div className='text-base text-[#FFFFFFB2]'>Missing something?</div>
                                            <button className='gradient-border  rounded-xl h-10 px-5 hover:opacity-80 duration-300'>Request keyword</button>
                                        </div>
                                    </>
                                }
                            </Panel>
                        </div>

                        {/* chosen keywords */}
                        <div className="flex-1">
                            <Panel title="Chosen keywords" subtitle="Finalize your set. High | Mid | Low intent per term. SELECTED KEYWORDS - HVAC SERVICES (6/8)">
                                <div className="space-y-3">
                                    <div className="space-y-4">
                                        {chosenKeywords.length === 0 && (
                                            <div className="text-sm text-[#FFFFFFB2]">No keywords selected yet.</div>
                                        )}
                                        {showSkeleton ? (
                                            Array.from({ length: 8 }).map((_, i) => <ShimmerWave key={`shim3-${i}`}/>)
                                        ) :
                                            chosenKeywords.map((k: any) => (
                                                <div key={k.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#FFFFFF1A]">
                                                    <div className="min-w-0">
                                                        <div className="text-sm truncate">{k?.keyword}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Tag small className={clsx('!py-0 h-6', k?.intent_level?.toLowerCase()?.trim() === 'high' ? '!border-[#00A63E]' : '!border-[#FEAC48]')}>{k?.intent_level}</Tag>
                                                        <button type='button'
                                                            onClick={() => { handleToggleKeywordActive(k.id); handleRemoveKeyword(k.id) }}
                                                            className="px-4 rounded-full font-medium hover:opacity-80 duration-300 border border-[#F14190] bg-transparent text-sm text-white !py-0 h-6 min-w-[60px] text-[10px]">Remove</button>

                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>


                {/* Competitors area */}

                <div className='bg-[#131219] border border-[#212129] p-4 rounded-2xl flex flex-col gap-5 mt-6'>
                    <div className="lg:col-span-8">
                        <Panel title="ProposalIQ - Local Competitors" subtitle="Use the same industry above. Add your own competitors with websites. VelocityIQ will pull competitive details from these sites.">
                            <div className="grid gap-3">
                                <div className="flex gap-4 mb-2">
                                    <div className='flex-1 flex flex-col'>
                                        {/* value={zip} onChange={(e) => setZip(e.target.value)} */}
                                        <label className='text-sm font-medium text-[#FFFFFF] mb-1'>YOUR COMPANY ZIP</label>
                                        <input className="bg-[#09090E] h-11 rounded-xl px-3 border border-[#FFFFFF1A] text-xs text-white w-full" />
                                        <p className='text-sm text-[#FFFFFFB2] mt-3'>This helps VelociIQ suggest local competitors around your market.</p>
                                    </div>
                                    <div className='flex-1 flex flex-col'>
                                        <label className='text-sm font-medium text-[#FFFFFF] mb-1'>CUSTOMER INDUSTRY</label>
                                        <input className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                        <p className='text-sm text-[#FFFFFFB2] mt-3'>This matches the industry you selected above.</p>
                                    </div>
                                </div>
                                <div>
                                    <div className=' font-semibold'>Now let's ask competitors for this industry</div>
                                    <p className='text-sm text-[#FFFFFFB2] mt-1'>Search for local competitors or choose from suggestions. You can add up to 3 competitors per industory.</p>

                                    <div className='flex-1 mt-5 flex items-center gap-5'>
                                        <input value={suggestionSearch} onChange={handleSuggestionSearch} className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                        <Button variant='outline' className='border-[#FFFFFF]'>Search</Button>
                                    </div>
                                </div>

                                <div className='text-xs mt-4 hidden'>SUGGESTIONS NEAR YOU</div>
                                <div className="space-y-5 hidden">
                                    {!suggestions.length && <div className='text-center'>Suggestions near you not found</div>}
                                    {suggestions.map((s) => (
                                        <div key={s.id} className="flex items-center text-[#FFFFFF] font-normal justify-between gap-4 p-3 rounded-xl border border-[#FFFFFF1A]">
                                            <div>
                                                <div className="font-medium">{s.competitor_name}</div>
                                                <div className="text-[10px] text-[#FFFFFFB2] bg-[#1B1A25] rounded-full w-fit px-3 py-1 mt-1">{s.competitor_location}</div>
                                            </div>

                                            <div>
                                                <Button className={clsx('!py-0 h-6 min-w-[60px] text-[10px]', selectedCompetitors.find((c) => c.id === s.id) ? '!border-[#00A63E]' : '!border-[#FFFFFFB2]')} variant={selectedCompetitors.find((c) => c.id === s.id) ? 'ghost' : 'outline'} onClick={() => handleAddCompetitor(s)}>
                                                    {selectedCompetitors.find((c) => c.id === s.id) ? 'Added' : 'Add'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {competitorData?.results?.data?.competitors?.length < 3 &&
                                    <CompetirorForm
                                        obSubmit={submit}
                                        isPending={cLoading}
                                    />}
                            </div>
                        </Panel>
                    </div>

                    <div className="lg:col-span-4 mt-2">
                        <Panel title={`Selected Competitors (${selectedCompetitors.length}/3)`} subtitle="VelocityIQ will pull details from these websites when generating ProposalIQ analysis.">
                            {showSkeleton ? (
                                Array.from({ length: 3 }).map((_, i) => <ShimmerWave key={`shim4-${i}`}/>)
                            ) :
                                <div className="space-y-3">
                                    {competitorData?.results?.data?.competitors.length === 0 && <div className="text-sm text-[#9CA0A6]">No competitors selected.</div>}
                                    {competitorData?.results?.data?.competitors.map((c:any) => (
                                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-[#FFFFFF1A]">
                                            <div>
                                                <div className="font-medium">{c.competitor_name}</div>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <div className="text-[10px] text-[#FFFFFFB2] bg-[#1B1A25] rounded-full w-fit px-3 py-1">{c.competitor_location}</div>
                                                    <Link to={c.competitor_website} target='_blank' className="text-[10px] text-[#FFFFFFB2] bg-[#08080C] rounded-full w-fit px-3 py-1">{c.competitor_website}</Link>
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <button onClick={() => (setCompetitorEditModal(c))}> <Icon name='edit' /></button>
                                                <button onClick={() => setDeleteItem(c?.id)}> <Icon name='trash' /></button>
                                                {/* <Button variant='outline' onClick={() => handleRemoveCompetitor(c.id)}>
                                               
                                            </Button> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>}
                        </Panel>
                    </div>
                </div>

                {/* Bottom preview & CTA */}
                <div className='mt-5'>


                    <CustomButton type='button' onClick={handleSave} isLoading={postLoading} className='!rounded-full ms-auto'>Save & Next</CustomButton>
                </div>
            </div>
            {competitorEditModal && <EditCompititorModal
                onConfirm={submit}
                onClose={() => setCompetitorEditModal("")}
                isOpen={competitorEditModal}
                confirmLoading={cLoading}
            />}
            <DeleteModal
                url="admin/competitors"
                isOpen={deleteItem}
                onClose={() => setDeleteItem(false)}
                onConfirm={onDeleteConfirm}
            />
        </div>
    );
};

export default IndustrySetupPage;

