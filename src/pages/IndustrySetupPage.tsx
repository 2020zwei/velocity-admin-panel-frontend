import clsx from 'clsx';
import React, { useMemo, useState, type ChangeEvent } from 'react';
import { Button as DradientButton } from "@/components/Button";
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

interface ToggleProps {
    checked: boolean;
    onChange: (v: boolean) => void;
}

interface Industry {
    id: string;
    label: string;
    hint?: string;
}

interface Keyword {
    id: number;
    text: string;
    intent: 'High' | 'Mid' | 'Low' | string;
}

interface SuggestedCompetitor {
    id: number;
    name: string;
    location?: string;
    website?: string;
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

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={classNames(
            'w-11 h-6 rounded-full p-1 flex items-center transition-all border-[#1EF46E] border',
            checked ? 'bg-[#1EF46E33] justify-end' : 'bg-[#2B2B35] justify-start'
        )}
    >
        <span className="w-4 h-4 rounded-full bg-white shadow" />
    </button>
);

const INDUSTRIES: Industry[] = [
    { id: 'hvac', label: 'HVAC Services', hint: 'HVAC repairs, service contracts' },
    { id: 'wireless', label: 'Wireless & Connectivity', hint: 'Wireless, telecommunication, cable' },
    { id: 'transport', label: 'Transportation & Logistics', hint: 'Fleet, LTL, carriers, moving' },
    { id: 'education', label: 'Education & Public Sector', hint: 'Education, municipalities, tuition services' },
];

const SAMPLE_KEYWORDS: Keyword[] = Array.from({ length: 8 }).map((_, i) => ({ id: i + 1, text: `AC system install/replace ${i + 1}`, intent: ['High', 'Mid', 'Low'][i % 3] }));

const SUGGESTED_COMPETITORS: SuggestedCompetitor[] = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    name: `CoolBreeze AC & Heating ${i + 1}`,
    location: 'Miami, FL - Near 33065',
    website: `https://www.coolbreeze${i + 1}.com`,
}));

const schema = z.object({
    name: z.string("Name is required").min(1),
    website: z.string().min(1).url(),
    location: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/* ----------------------------- IndustrySetupPage ---------------------------- */
const IndustrySetupPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isValid, errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });


    // industrySearch
    const [industrySearch, setIndustrySearch] = useState<string>('HVAC Services');
    const [filteredIndustry, setFilteredIndustry] = useState<Industry[]>(INDUSTRIES);
    // end industrySearch

    const [keywordLibrary, setKeywordLibrary] = useState<Keyword[]>(SAMPLE_KEYWORDS);
    const [chosenKeywords, setChosenKeywords] = useState<Array<Keyword & { active?: boolean }>>([]);
    const [keywordSearch, setKeywordSearch] = useState<string>('');
    const [selectedCompetitors, setSelectedCompetitors] = useState<SelectedCompetitor[]>([]);

    const [zip, setZip] = useState<string>('33065');
    // setSuggestions
    const [suggestionSearch, setSuggestionSearch] = useState<string>('');
    const [suggestions, setSuggestions] = useState<SuggestedCompetitor[]>(SUGGESTED_COMPETITORS);
    // end setSuggestions


    const filteredKeywords = useMemo<Keyword[]>(() => {
        if (!keywordSearch) return keywordLibrary;
        return keywordLibrary.filter((k) => k.text.toLowerCase().includes(keywordSearch.toLowerCase()));
    }, [keywordLibrary, keywordSearch]);


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
        c: { id?: number; name: string; website?: string; location?: string }
    ) => {
        const id:any = c.id ?? c.name; // fallback key

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
            setFilteredIndustry(INDUSTRIES);
            return;
        }

        setFilteredIndustry(
            INDUSTRIES.filter(ind =>
                ind.label.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handleSuggestionSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSuggestionSearch(value);

        if (!value.trim()) {
            setSuggestions(SUGGESTED_COMPETITORS);
            return;
        }

        setSuggestions(
            SUGGESTED_COMPETITORS.filter(ind =>
                ind.name.toLowerCase().includes(value.toLowerCase())
            )
        );
    };


    const submit = (data: FormValues) => {

        reset();
    };



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
                        <div className="rounded-full bg-[#1B1A25] border border-[#FFFFFF1A] px-4 py-2 text-xs">STEP 2 - PICK KEYWORDS (MAX 5)</div>
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
                                    <div className="text-sm text-[#FFFFFFB2] pt-2">SEARCH INDUSTRIES</div>
                                    <input value={industrySearch} onChange={handleIndustrySearch} className="w-full bg-[#08080C] h-12 rounded-xl px-3 border border-[#FFFFFF1A] text-sm text-white" placeholder="e.g. HVAC, Wireless, Transportation..." />

                                    <div className="mt-3 space-y-4">
                                        {filteredIndustry.map((ind) => (
                                            <button
                                                key={ind.id}
                                                onClick={() => {
                                                    setIndustrySearch(ind.label);
                                                    setFilteredIndustry(INDUSTRIES);
                                                }}
                                                className={classNames(
                                                    'w-full text-left p-3 rounded-xl flex flex-col gap-1 hover:opacity-70 duration-300',
                                                    industrySearch === ind.label
                                                        ? 'gradient-border text-white'
                                                        : 'border border-[#FFFFFF1A]'
                                                )}
                                            >
                                                <div className="text-sm">{ind.label}</div>
                                                <div className="text-xs text-[#FFFFFFB2]">{ind.hint}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        {/* keyword library */}
                        <div className="max-w-[460px]">
                            <Panel title="Industry keyword library" subTitleClass='max-w-[270px]' subtitle="Choose keywords to add to your selection. HVAC SERVICE KEYWORDS">

                                <div className="grid gap-4">
                                    {filteredKeywords.map((kw) => (
                                        <div key={kw.id} className="flex items-center text-[#FFFFFF] font-normal justify-between gap-4 p-3 rounded-xl border border-[#FFFFFF1A]">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="text-sm truncate">{kw.text}</div>
                                                {/* active={kw.intent === 'High'} */}
                                                <Tag small className={clsx('!py-0 h-6', kw.intent === 'High' ? '!border-[#00A63E]' : '!border-[#FEAC48]')}>{kw.intent}</Tag>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button className={clsx('!py-0 h-6 min-w-[60px] text-[10px]', chosenKeywords.find((c) => c.id === kw.id) ? '!border-[#00A63E]' : '!border-[#FFFFFFB2]')} variant={selectedCompetitors.find((c) => c.id === kw.id) ? 'ghost' : 'outline'} onClick={() => handleAddKeyword(kw)}>
                                                    {chosenKeywords.find((c) => c.id === kw.id) ? 'Added' : 'Add'}
                                                </Button>
                                                {/* <Button variant="outline" className='border-[#00A63E] !py-0 h-6 min-w-[60px] text-[10px]' onClick={() => handleAddKeyword(kw)}>Add</Button> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className='text-sm text-[#FFFFFFB2] py-4 border-b border-[#FFFFFF1A]'>
                                    Keywords here are tailored to that industry (AC system, carriers, student tablets, etc.). Click "Add" to send them to your chosen list.
                                </div>
                                <div className='flex items-center gap-3 justify-end mt-4'>
                                    <div className='text-base text-[#FFFFFFB2]'>Missing something?</div>
                                    <button className='gradient-border  rounded-xl h-10 px-5 hover:opacity-80 duration-300'>Request keyword</button>
                                </div>
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

                                        {chosenKeywords.map((k) => (
                                            <div key={k.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#FFFFFF1A]">
                                                <div className="min-w-0">
                                                    <div className="text-sm truncate">{k.text}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Tag small className={clsx('!py-0 h-6', k.intent === 'High' ? '!border-[#00A63E]' : '!border-[#FEAC48]')}>{k.intent}</Tag>
                                                    <Toggle checked={Boolean(k.active)} onChange={() => { handleToggleKeywordActive(k.id); handleRemoveKeyword(k.id) }} />
                                                </div>
                                            </div>
                                        ))}
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
                                        <label className='text-sm font-medium text-[#FFFFFF] mb-1'>YOUR COMPANY ZIP</label>
                                        <input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-[#09090E] h-11 rounded-xl px-3 border border-[#FFFFFF1A] text-xs text-white w-full" />
                                        <p className='text-sm text-[#FFFFFFB2] mt-3'>This helps VelociIQ suggest local competitors around your market.</p>
                                    </div>
                                    <div className='flex-1 flex flex-col'>
                                        <label className='text-sm font-medium text-[#FFFFFF] mb-1'>CUSTOMER INDUSTRY</label>
                                        <input value={zip} onChange={(e) => setZip(e.target.value)} className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
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

                                <div className='text-xs mt-4'>SUGGESTIONS NEAR YOU</div>
                                <div className="space-y-5">
                                    {!suggestions.length && <div className='text-center'>Suggestions near you not found</div>}
                                    {suggestions.map((s) => (
                                        <div key={s.id} className="flex items-center text-[#FFFFFF] font-normal justify-between gap-4 p-3 rounded-xl border border-[#FFFFFF1A]">
                                            <div>
                                                <div className="font-medium">{s.name}</div>
                                                <div className="text-[10px] text-[#FFFFFFB2] bg-[#1B1A25] rounded-full w-fit px-3 py-1 mt-1">{s.location}</div>
                                            </div>

                                            <div>
                                                <Button className={clsx('!py-0 h-6 min-w-[60px] text-[10px]', selectedCompetitors.find((c) => c.id === s.id) ? '!border-[#00A63E]' : '!border-[#FFFFFFB2]')} variant={selectedCompetitors.find((c) => c.id === s.id) ? 'ghost' : 'outline'} onClick={() => handleAddCompetitor(s)}>
                                                    {selectedCompetitors.find((c) => c.id === s.id) ? 'Added' : 'Add'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSubmit(submit)} className="grid gap-5 mt-5">

                                    <div className="mt-4 border-b pb-8 border-[#FFFFFF1A]">
                                        <div className=' font-semibold'>Add a custom competitor</div>
                                        <p className="text-sm text-[#FFFFFFB2] mt-1">If you don't see a competitor listed, add them manually. Name and website are required..</p>
                                        <div className="grid gap-5 mt-5">
                                            <div className='flex items-center gap-6'>
                                                <div className='flex-1'>
                                                    <div className='flex-1 flex flex-col'>
                                                        <label className="text-sm font-medium text-[#FFFFFF] mb-1">COMPETITOR NAME</label>
                                                        <input {...register("name")} placeholder="e.g. CoolBreeze AC & Heating" className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                                    </div>
                                                    {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name.message}</p>}
                                                </div>


                                                <div className='flex-1'>
                                                    <div className='flex-1 flex flex-col'>
                                                        <label className="text-sm font-medium text-[#FFFFFF] mb-1">COMPETITOR WEBSITE</label>
                                                        <input {...register("website")} placeholder="https://www.example.com" className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                                    </div>
                                                    {errors.website && <p className='text-red-500 text-xs mt-1'>{errors.website.message}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-[#FFFFFF] mb-1">LOCATION (OPTIONAL)</label>
                                                <div className='flex items-center gap-6'>
                                                    <input {...register("location")} placeholder="City, ST" className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                                    <Button type='submit' variant="outline" className='border-[#FFFFFF] whitespace-nowrap'>Add custom competitor</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </Panel>
                    </div>

                    <div className="lg:col-span-4 mt-2">
                        <Panel title={`Selected Competitors (${selectedCompetitors.length}/3)`} subtitle="VelocityIQ will pull details from these websites when generating ProposalIQ analysis.">
                            <div className="space-y-3">
                                {selectedCompetitors.length === 0 && <div className="text-sm text-[#9CA0A6]">No competitors selected.</div>}
                                {selectedCompetitors.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-[#FFFFFF1A]">
                                        <div>
                                            <div className="font-medium">{c.name}</div>
                                            <div className='flex items-center gap-2 mt-1'>
                                                <div className="text-[10px] text-[#FFFFFFB2] bg-[#1B1A25] rounded-full w-fit px-3 py-1">{c.location}</div>
                                                <div className="text-[10px] text-[#FFFFFFB2] bg-[#08080C] rounded-full w-fit px-3 py-1">{c.website}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <Button variant='outline' className={clsx('!py-0 h-6 min-w-[60px] text-[10px]')} onClick={() => handleRemoveCompetitor(c.id)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                </div>

                {/* Bottom preview & CTA */}
                <div className='mt-5'>
                    <div className='flex gap-9 mb-5'>
                        <div className="text-sm text-[#FFFFFFB2] max-w-[280px]">
                            Tip: keep it simple for your sellers. ZIP + industry + 2-3 real local competitors is more than enough.
                        </div>

                        <div className="bg-[#07070A] border border-[#FFFFFF1A] rounded p-4 min-w-[320px]">
                            <div className="text-xs text-[#FFFFFFB2] mb-2">Preview (what VelocityIQ saves):</div>
                            <pre className="text-xs text-[#FFFFFFB2] max-h-40 overflow-auto dark-scrollbar bg-transparent">{JSON.stringify({ industryId: industrySearch, keywords: chosenKeywords, competitors: selectedCompetitors, zip }, null, 2)}</pre>
                        </div>
                    </div>

                    <DradientButton onClick={() => alert('Save & Next')} className='!rounded-full ms-auto'>Save & Next</DradientButton>
                </div>
            </div>
        </div>
    );
};

export default IndustrySetupPage;
