import { Button } from '@/components/Button'
import Dropdown from '@/components/Dropdown'
import Icon from '@/components/Icon'
import clsx from 'clsx'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'


const keywords = [
    {
        id: 1,
        lable: "New bussiness Registration"
    },
    {
        id: 2,
        lable: "Recenet dunding announcemnet"
    },
    {
        id: 3,
        lable: "Hiring for sales role"
    },
    {
        id: 4,
        lable: "Office relocation/ New HQ"
    },
    {
        id: 5,
        lable: "Website traffic spike"
    },
    {
        id: 6,
        lable: "New location opening"
    },
    {
        id: 7,
        lable: "Contract renewal window"
    },
    {
        id: 8,
        lable: "RFP / bid activity"
    },
]

const AddSeller = () => {
    const [filterdKeywords, setFilterdKeywords] = useState(keywords ?? [])
    const [selectedTags, setSelectedTags] = useState<string[] | string>([]);
    const navigate = useNavigate()

    const handleKeySearch = (e: any) => {
        const val = e.target.value.toLowerCase().trim();

        if (!val) {
            setFilterdKeywords(keywords);
            return;
        }

        const searched = keywords.filter((item) =>
            item.lable?.toLowerCase().includes(val)
        );

        setFilterdKeywords(searched);
    };


    return (
        <>
            <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                <div>
                    <h1 className="text-2xl font-semibold">Seller Intake</h1>
                    <p className='text-base max-w-[470px] text-[#FEFFFFCC]'>Zero-noise onboarding: upload your roster or add each seller, then submit once for your org.</p>
                </div>
                <div className='flex items-center justify-between gap-3'>
                    <div className='bg-[#000000] border border-[#212129] me-5 px-2 h-6 min-w-[104px] rounded-full text-[10px] flex items-center justify-end gap-2'>
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

                    <form action="">
                        <div className='border border-[#212129] rounded-2xl px-8 py-4 bg-dark-gradient flex flex-col gap-5'>
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
                                    <input type="text" placeholder='eg. Alex Martinez' className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]' />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="" className=' font-medium text-base'>
                                        Email
                                        <span className='text-[#EE2B93] ps-1'>*</span>
                                    </label>
                                    <input type="email" placeholder='e.g. alex@salespartner.com' className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]' />
                                </div>
                                <div className='flex items-center justify-between gap-3'>
                                    <div className='flex flex-col gap-2 flex-1'>
                                        <label htmlFor="" className=' font-medium text-base'>
                                            Dealer Code
                                            <span className='text-[#EE2B93] ps-1'>*</span>
                                        </label>
                                        <input type="text" placeholder='e.g. DLR-2302' className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]' />
                                    </div>
                                    <div className='flex flex-col gap-2 flex-1'>
                                        <label htmlFor="" className=' font-medium text-base'>
                                            Territory- State
                                            <span className='text-[#EE2B93] ps-1'>*</span>
                                        </label>
                                        <Dropdown
                                            options={["Design", "Development", "Marketing", "Sales"]}
                                            value={selectedTags}
                                            onSelect={(val) => {
                                                setSelectedTags(val as string[]);
                                                console.log("Selected tags:", val);
                                            }}
                                            classNames={{
                                                trigger: "!bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]",
                                                selectedOption: "bg-blue-gradient"
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label htmlFor="" className=' font-medium text-base'>
                                        Zip Code
                                        <span className='text-[#EE2B93] ps-1'>*</span>
                                    </label>
                                    <input type="text" placeholder='Enter comma-separated ZIP codes....' className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-5'>
                                <div className='flex flex-col gap-2'>
                                    <div>
                                        <label className=' font-medium text-base'>
                                            Keywords
                                            <span>*</span>
                                        </label>
                                        <p>Select the primary buyer signals VelocityIQ should map to this seller.</p>
                                    </div>
                                    <div className={clsx("flex items-center bg-[#09090E] h-14 rounded-xl px-3 gap-2 border border-[#FFFFFF1A]")}>
                                        <span className={clsx("opacity-60 md:block hidden")}><Icon name='search' /></span>
                                        <input
                                            onChange={handleKeySearch}
                                            type="text"
                                            placeholder="Search Keyword..."
                                            className={clsx("bg-transparent outline-none flex-1 text-white md:block hidden")}
                                        />
                                    </div>
                                </div>
                                <div>
                                    {filterdKeywords.length ? filterdKeywords.map((item) => (
                                        <button type='button' key={item.id} className={clsx('my-2 mx-1 rounded-full px-3 py-1 border border-[#EE2B93] text-[#FFFFFF80] hover:bg-[#EE2B934D] hover:text-white hover:border-[#EE2B934D] duration-300')}>{item.lable}</button>
                                    )) : <div className='text-center font-semibold'>Keywords not found</div>}
                                </div>
                            </div>

                            <div>
                                <div className='font-semibold text-lg mb-4'>Saved Sellers</div>
                                <label htmlFor="" className='font-medium text-base mb-2 block'>
                                    Add Approvers
                                </label>

                                <Dropdown
                                    multiple
                                    options={["Design", "Development", "Marketing", "Sales"]}
                                    value={selectedTags}
                                    onSelect={(val) => {
                                        setSelectedTags(val as string[]);
                                        console.log("Selected tags:", val);
                                    }}
                                    classNames={{
                                        trigger: "!bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]",
                                        selectedOption: "bg-blue-gradient"
                                    }}
                                />
                            </div>


                        </div>
                        <div className='flex items-center mt-10 gap-10'>
                            <Button className='!rounded-full'>
                                Submit intake
                            </Button>
                            <div className='flex items-center whitespace-nowrap text-[#FEFFFFCC] text-base'>
                                <span className=' font-semibold text-white pe-1'>Heads up:</span>
                                by submitting, you’re authorizing VelocityIQ to onboard these details into your workspace.
                            </div>
                        </div>
                    </form>
                </div>


                <div className='text-[#FEFFFFCC] text-base border border-[#212129] rounded-2xl px-8 py-4 bg-dark-gradient flex flex-col gap-5 h-fit'>

                    <div>
                        <div className='font-semibold text-2xl text-white'>What happens next?</div>
                        <p>Add each seller one by one, save them to your intake list, then submit when you're done.</p>
                    </div>
                    <ul className='pt-6 list-disc ps-4'>
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