import { twMerge } from "tailwind-merge"

export const ShimmerRow = () => (
    <tr className="even:bg-black-800/60">
        <td className="px-4 sm:px-6 py-3">
            <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
        </td>
        <td className="px-4 sm:px-6 py-3">
            <div className="h-4 w-56 rounded bg-white/10 animate-pulse" />
        </td>
        <td className="px-4 sm:px-6 py-3">
            <div className="h-4 w-28 rounded bg-white/10 animate-pulse" />
        </td>
        <td className="px-4 sm:px-6 py-3">
            <div className="ms-auto h-8 w-20 rounded bg-white/10 animate-pulse" />
        </td>
    </tr>
);

export const ShimmerWave = ({ className }: { className?: string }) => {
    return (
        <div className={twMerge("bg-black-700 rounded-xl", className)}>
            <div className="px-4 sm:px-6 py-3">
                <div className="h-4 rounded bg-white/10 animate-pulse" />
            </div>
        </div>
    )
}
