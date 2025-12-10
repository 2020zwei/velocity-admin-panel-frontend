// import { Button } from '@/components/Button'
// import Icon from '@/components/Icon'
// import React from 'react'
// import { useNavigate } from 'react-router-dom'

// const UploadDocument = () => {
//     const navigate = useNavigate()
//     return (
//         <div>
//             <div className='flex items-center justify-between'>
//                 <div>
//                     <h1 className="text-2xl font-semibold">Seller Intake</h1>
//                     <p className='text-base max-w-[470px]'>Zero-noise onboarding: upload your roster or add each seller, then submit once for your org.</p>
//                 </div>
//                 <div className='flex items-center justify-between gap-3 w-[405px]'>
//                     <div className='bg-[#000000] border border-[#212129] px-2 h-6 min-w-[104px] rounded-full text-[10px] flex items-center justify-end gap-2'>
//                         <span className='w-2 h-2 rounded-full bg-[#EE2B93]'></span>
//                         Zero noise intake
//                     </div>
//                     <div className='flex items-center gap-1'>
//                         <button type='button' className='!rounded-full bg-[#0F1627] border border-[#FFFFFF1A] w-[100px] text-center h-[30px] text-xs hover:opacity-80'>
//                             Upload file
//                         </button>
//                         <Button onClick={() => navigate('/seller/add')} className='!rounded-full w-[109px] flex items-center justify-center h-[30px] text-xs'>
//                             Enter manually
//                         </Button>
//                     </div>
//                 </div>
//             </div>
//             <div className=' grid lg-xl:grid-cols-2 gap-6 mt-[50px]'>
//                 <div className='border border-[#212129] rounded-2xl px-8 py-10 bg-dark-gradient flex flex-col gap-5'>
//                     <div>
//                         <div className=' font-semibold text-lg text-white'>Upload your existing roster</div>
//                         <p className='text-base text-[#FEFFFFCC]'>Drop in a CSV or Excel file with your sellers & territories. we’ll handle the rest.</p>
//                     </div>
//                     <div className='bg-[#14141C] border border-dashed border-[#F14190] rounded-md w-full flex items-center justify-center flex-col gap-4 py-6'>
//                         <div className='w-[50px] h-[50px] rounded-md bg-blue-gradient flex items-center justify-center'>
//                             <Icon name='upload'/>
//                         </div>
//                         <div className='text-center'>
//                             <div className='font-medium'>Choose a file or drag & drop it here</div>
//                             <div className='text-[#FFFFFFB2] text-xs'>Supports CSV and Excel files up to 10MB</div>
//                         </div>
//                         <button className='bg-[#EE2B9333] border border-[#F14190] rounded px-6 py-2 hover:opacity-80 duration-300'>Browse File</button>
//                     </div>
//                     <div className='text-xs'>
//                         Recommended headers: Sales Agent Name, Email, Dealer Code, State, ZIP code(s), Signals.
//                     </div>
//                 </div>
//                 <div className='pb-5 text-[#FEFFFFCC] text-base border border-[#212129] rounded-2xl px-8 py-4 bg-dark-gradient flex flex-col gap-5 h-fit'>

//                     <div>
//                         <div className='font-semibold text-2xl text-white'>What happens next?</div>
//                         <p>Add each seller one by one, save them to your intake list, then submit when you're done.</p>
//                     </div>
//                     <ul className='pt-6 list-disc ps-4'>
//                         <li>We’ll confirm seller identity and dealer code against your agreement.</li>
//                         <li>Territory (state + ZIPs) helps route the right buyer Signals and opportunities.</li>
//                         <li>Signals help VelocityIQ prioritize who to surface first in your sellers’ day.</li>
//                         <li>No passwords or sensitive credentials are collected on this page.</li>
//                     </ul>
//                     <div>Have a large team? Use Upload file. Adding a handful today? Use Enter manually and save each seller before submitting.</div>
//                 </div>
//             </div>
//             <div className='flex items-center mt-[50px] gap-10'>
//                 <Button className='!rounded-full'>
//                     Submit intake
//                 </Button>
//                 <div className='flex items-center whitespace-nowrap text-[#FEFFFFCC] text-base'>
//                     <span className=' font-semibold text-white pe-1'>Heads up:</span>
//                     by submitting, you’re authorizing VelocityIQ to onboard these details into your workspace.
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default UploadDocument





import { Button } from '@/components/Button'
import Icon from '@/components/Icon'
import React, {
    useRef,
    useState,
    type DragEvent,
    type ChangeEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['csv', 'xls', 'xlsx']

const UploadDocument = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
            fileInputRef.current.click()
        }
    }

    const getFileExtension = (file: File) => {
        const parts = file.name.split('.')
        if (parts.length < 2) return ''
        return parts.pop()!.toLowerCase()
    }

    const validateFile = (file: File): string | null => {
        const extension = getFileExtension(file)

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return 'Invalid file type. Please upload a CSV or Excel file.'
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return 'File is too large. Maximum size is 10MB.'
        }

        return null
    }

    const handleFile = (file: File | null) => {
        if (!file) return

        const validationError = validateFile(file)

        if (validationError) {
            setSelectedFile(null)
            setError(validationError)
            return
        }

        setSelectedFile(file)
        setError(null)
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        handleFile(file)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0] || null
        handleFile(file)
    }

    const handleSubmit = () => {
        if (!selectedFile) {
            setError('Please upload a valid CSV or Excel file before submitting.')
            return
        }

        setIsSubmitting(true)

        // TODO: replace with actual upload / API call
        console.log('Submitting intake with file:', selectedFile)

        setTimeout(() => {
            setIsSubmitting(false)
            // navigate('/seller/summary')
        }, 500)
    }

    const clearFile = () => {
        setSelectedFile(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // utils/downloadTemplate.ts
    const downloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/sample.csv";
        link.download = "sample-file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-8">
            {/* Top header row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                    <h1 className="text-xl font-semibold md:text-2xl">
                        Seller Intake
                    </h1>
                    <p className="text-sm md:text-base max-w-[470px] text-[#FEFFFFCC]">
                        Zero-noise onboarding: upload your roster or add each seller, then
                        submit once for your org.
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center md:justify-end">
                    <div className="bg-[#000000] border border-[#212129] me-5 px-2 h-6 rounded-full text-[10px] flex items-center justify-end gap-2 self-start md:self-auto">
                        <span className="w-2 h-2 rounded-full bg-[#EE2B93]" />
                        Zero noise intake
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <Button
                            onClick={() => downloadTemplate()}
                            className="!rounded-full bg-[#0F1627] border border-[#FFFFFF1A] h-[30px] min-w-fit text-xs"
                        >
                            Download Template
                        </Button>
                        <Button
                            onClick={() => navigate('/seller/add')}
                            bgClass='bg-[#0F1627]'
                            className="!rounded-full bg-[#0F1627] border border-[#FFFFFF1A] h-8 min-w-fit text-xs"
                        >
                            Enter manually
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 mt-2 lg-xl:grid-cols-2">
                {/* Upload card */}
                <div className="border border-[#212129] rounded-2xl px-6 pb-6 pt-3 bg-dark-gradient flex flex-col gap-3 h-fit">
                    <div>
                        <div className="font-semibold text-xl sm:text-2xl text-white">
                            Upload your existing roster
                        </div>
                        <p className="mt-2 text-[15px] text-[#FEFFFFCC]">
                            Drop in a CSV or Excel file with your sellers & territories. we’ll
                            handle the rest.
                        </p>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                        onChange={handleInputChange}
                    />

                    {/* Drop zone */}
                    <div
                        className={`bg-[#14141C] rounded-md w-full flex items-center justify-center py-6 flex-col gap-4 border border-dashed transition-colors ${error
                            ? 'border-red-500'
                            : isDragging
                                ? 'border-[#F14190] bg-[#1B1B26]'
                                : 'border-[#F14190]'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="w-[40px] h-[40px] rounded-md bg-blue-gradient flex items-center justify-center">
                            <Icon name="upload" />
                        </div>
                        <div className="text-center px-4">
                            <div className="font-medium text-sm sm:text-base">
                                Choose a file or drag & drop it here
                            </div>
                            <div className="text-[#FFFFFFB2] text-xs mt-1">
                                Supports CSV and Excel files up to 10MB
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={openFileDialog}
                            className="bg-[#EE2B9333] border border-[#F14190] rounded px-6 py-2 hover:opacity-80 duration-300 text-xs sm:text-sm"
                        >
                            Browse File
                        </button>

                        {selectedFile && (
                            <div className="mt-3 px-3 py-2 rounded bg-[#0F1627] text-xs w-full max-w-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="font-medium truncate">
                                        {selectedFile.name}
                                    </span>
                                    <span className="text-[#FFFFFF99]">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="text-[11px] underline text-[#FFFFFFB2] hover:opacity-80 self-start sm:self-auto"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-2 text-xs text-red-400 text-center max-w-md px-4">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="text-[11px] sm:text-xs text-[#FEFFFFCC]">
                        Recommended headers: Sales Agent Name, Email, Dealer Code, State,
                        ZIP code(s), Signals.
                    </div>
                </div>

                {/* Sidebar card */}
                <div className="pb-5 text-[#FEFFFFCC] text-sm sm:text-base border border-[#212129] rounded-2xl px-4 py-4 sm:px-6 lg:px-8 bg-dark-gradient flex flex-col gap-4 h-fit">
                    <div>
                        <div className="font-semibold text-xl sm:text-2xl text-white">
                            What happens next?
                        </div>
                        <p className="mt-2">
                            Once you submit, VelocityIQ will validate your data, map territories, and prep your sellers for Signals and VCORE.
                        </p>
                    </div>
                    <ul className="list-disc ps-4 space-y-1">
                        <li>We’ll confirm seller identity and dealer code against your agreement.</li>
                        <li>Territory (state + ZIPs) helps route the right buyer Signals and opportunities.</li>
                        <li>Signals help VelocityIQ prioritize who to surface first in your sellers’ day.</li>
                        <li>No passwords or sensitive credentials are collected on this page.</li>
                    </ul>
                    <div>
                        Have a large team? Use Upload file. Adding a handful today? Use
                        Enter manually and save each seller before submitting.
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="flex flex-col gap-4 mt-4 md:mt-8 md:flex-row md:items-center md:gap-8">
                <Button
                    className="!rounded-full disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting…' : 'Submit intake'}
                </Button>
                <div className="text-xs sm:text-sm md:text-base text-[#FEFFFFCC] md:max-w-xl">
                    <span className="font-semibold text-white pe-1">Heads up:</span>
                    by submitting, you’re authorizing VelocityIQ to onboard these details
                    into your workspace.
                </div>
            </div>
        </div>
    )
}

export default UploadDocument
