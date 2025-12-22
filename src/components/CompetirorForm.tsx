import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from './Button';
import { useEffect } from 'react';
const schema = z.object({
    competitor_name: z.string("Name is required").min(1),
    competitor_website: z.string().min(1).url(),
    competitor_location: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;

const CompetirorForm = ({ obSubmit, isPending = false, defaultData = null }: { obSubmit: (data: FormValues) => void, isPending?: boolean, defaultData?: any }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { isValid, errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });
    const submit = async (data: FormValues) => {
        obSubmit(data)
        reset();
    };

    useEffect(() => {
        if (defaultData) {
            reset(defaultData)
        }
    }, [defaultData])
    const con=defaultData?'grid gap-6':'flex items-center gap-6'

    return (
        <div>
            <form onSubmit={handleSubmit(submit)} className="grid gap-5 mt-5">

                <div className={defaultData?'':"mt-4 border-b pb-8 border-[#FFFFFF1A]"}>
                    {defaultData ? null:
                        <>
                            <div className=' font-semibold'>Add a custom competitor</div>
                            <p className="text-sm text-[#FFFFFFB2] mt-1">If you don't see a competitor listed, add them manually. Name and website are required..</p></>
                    }
                    <div className="grid gap-5 mt-5">
                        <div className={con}>
                            <div className='flex-1'>
                                <div className='flex-1 flex flex-col'>
                                    <label className="text-sm font-medium text-[#FFFFFF] mb-1">COMPETITOR NAME</label>
                                    <input {...register("competitor_name")} placeholder="e.g. CoolBreeze AC & Heating" className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                </div>
                                {errors.competitor_name && <p className='text-red-500 text-xs mt-1'>{errors.competitor_name.message}</p>}
                            </div>


                            <div className='flex-1'>
                                <div className='flex-1 flex flex-col'>
                                    <label className="text-sm font-medium text-[#FFFFFF] mb-1">COMPETITOR WEBSITE</label>
                                    <input {...register("competitor_website")} placeholder="https://www.example.com" className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                </div>
                                {errors.competitor_website && <p className='text-red-500 text-xs mt-1'>{errors.competitor_website.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[#FFFFFF] mb-1">LOCATION (OPTIONAL)</label>
                            <div className='flex items-center gap-6'>
                                <input {...register("competitor_location")} placeholder="City, ST" className="bg-[#09090E] h-11 text-xs rounded-xl px-3 border border-[#FFFFFF1A] text-white w-full" />
                                {!defaultData&&<Button type='submit' isLoading={isPending} bgClass='' className=' rounded-full px-8 font-normal border border-[#FFFFFF1A] whitespace-nowrap'>Add custom competitor</Button>}
                            </div>
                        </div>
                        {defaultData&&<Button type='submit' isLoading={isPending} className=' rounded-full px-8 font-normal border border-[#FFFFFF1A] whitespace-nowrap'>Update</Button>}
                    </div>
                </div>

            </form>
        </div>
    )
}

export default CompetirorForm