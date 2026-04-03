import AddApproverModal from "@/components/AddApproverModal";
import { Button } from "@/components/Button";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";
import TableActions from "@/components/TableActions";
import { ShimmerRow } from "@/components/TableShimmerRow";
import { useApi } from "@/hooks/useApi";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "@/api";


function Approvers() {
    const { search } = useLocation()
    const [deleteItem, setDeleteItem] = useState<any>(0);
    const [isApproverModal, setIsApproverModal] = useState<any>("");
    const [needApproval, setNeedApproval] = useState<boolean>(true);
    const [approvalSettingLoading, setApprovalSettingLoading] = useState(false);
    const page = search.slice(search.lastIndexOf("=") + 1)
    const { data: apvData, isLoading, refetch, isRefetching } = useApi({
        url: `/admin/approvers?page=${page ? page : 1}&&page_size=20`,
        auto: true,
        method: "get",
        transformResponse: (d) => d
    });

    const { data: approvalSettingData } = useApi({
        url: "/admin/approval-setting/",
        auto: true,
        method: "get",
        transformResponse: (d) => d,
    });

    useEffect(() => {
        const needApprovalFromApi = approvalSettingData?.data?.need_approval;
        if (needApprovalFromApi !== undefined) {
            setNeedApproval(Boolean(needApprovalFromApi));
        }
    }, [approvalSettingData]);

    const saveApprovalSetting = async () => {
        setApprovalSettingLoading(true);
        try {
            await axiosInstance.patch("/admin/approval-setting/", { need_approval: needApproval });
        } catch {
            // error handled by axios interceptor
        } finally {
            setApprovalSettingLoading(false);
        }
    };


    const handleAction = (item: any, type: string) => {
        if (type === 'delete') {
            setDeleteItem(item?.id);
        }
        else if (type === "edit") {
            setIsApproverModal(item)
        }
    }

    const onDeleteConfirm = async () => {
        setDeleteItem("")
        refetch()
    }
    const onConfirm = async () => {
        await refetch()
        setIsApproverModal('')
    }
    const showSkeleton = isLoading || isRefetching;
    // if (isLoading) {
    //     return <div className=" fixed bg-black-700/50 z-[999] h-screen w-screen top-0 start-0 end-0 bottom-0 flex items-center justify-center"><Spinner /></div>
    // }
    const approvers: any[] = apvData?.results?.data?.approvers ?? []
    const totalPages = Math.ceil(apvData?.count / 20)
    return (
        <>
            <div className="min-h-screen bg-black text-white flex">
                <section className="flex-1 bg-dark-default min-w-0">
                    <div className="sm:flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-semibold">Approvers</h1>

                        <Button onClick={() => setIsApproverModal(true)} className="sm:ms-0 ms-auto">
                            + Add Approver
                        </Button>
                    </div>

                    <div className="mb-6 p-4 rounded-lg bg-black-800/60 border border-[#151623]">
                        <p className="text-sm font-medium text-slate-200 mb-3">Does all proposal require approval?</p>
                        <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={needApproval === true}
                                    onChange={() => setNeedApproval(true)}
                                    disabled={approvalSettingLoading}
                                    className="w-4 h-4 rounded border-slate-500 bg-black-800 text-[#D4368E] focus:ring-[#D4368E]"
                                />
                                <span className="text-slate-200">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={needApproval === false}
                                    onChange={() => setNeedApproval(false)}
                                    disabled={approvalSettingLoading}
                                    className="w-4 h-4 rounded border-slate-500 bg-black-800 text-[#D4368E] focus:ring-[#D4368E]"
                                />
                                <span className="text-slate-200">No</span>
                            </label>
                        </div>
                        {needApproval === false && (
                            <p className="mt-3 text-xs text-slate-400 italic">
                                Note: Proposals with promotions will require approval even if &quot;No&quot; is selected.
                            </p>
                        )}
                        <div className="mt-4">
                            <Button
                                onClick={saveApprovalSetting}
                                disabled={approvalSettingLoading}
                                isLoading={approvalSettingLoading}
                                // className="p-1 w-16"
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                    {!isLoading && !approvers && <div className="text-center bg-black-800 py-4 rounded-xl">Reps not found</div>}
                    <>
                        <div
                            className="w-full overflow-x-auto rounded-md bg-black-900/40"
                            style={{ WebkitOverflowScrolling: "touch" }}
                        >
                            <table className="w-full text-sm border-separate border-spacing-y-2">
                                {/* Gradient header */}
                                <thead>
                                    <tr className="bg-blue-gradient text-xs sm:text-sm md:text-base font-medium capitalize tracking-wide text-white">
                                        <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap rounded-l-md">
                                            Approver Name
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">
                                            Email
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-right rounded-r-md pr-4 sm:pr-6 whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                {/* Rows */}
                                <tbody>
                                    {showSkeleton ? (
                                        Array.from({ length: 8 }).map((_, i) => <ShimmerRow key={i} />)
                                    ) : (
                                        approvers.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="even:bg-black-800/60 text-white"
                                            >
                                                <td className="px-4 sm:px-6 py-3 whitespace-nowrap capitalize">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                    {item.email}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <TableActions item={item} onClick={handleAction} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>

                                {/* <tbody>
                                        {approvers.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="even:bg-black-800/60 text-white"
                                            >
                                                <td className="px-4 sm:px-6 py-3 whitespace-nowrap capitalize">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                    {item.email}
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <TableActions item={item} onClick={handleAction} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody> */}

                            </table>
                        </div>
                        {totalPages > 1 &&
                            <Pagination
                                totalPages={totalPages}
                                baseUrl="/approvers"
                            />}
                    </>

                </section>
            </div>
            <DeleteModal
                url="admin/approvers"
                isOpen={deleteItem}
                onClose={() => setDeleteItem(false)}
                onConfirm={onDeleteConfirm}
            />
            <AddApproverModal
                isOpen={isApproverModal}
                onClose={() => { setIsApproverModal("") }}
                onConfirm={onConfirm}
            />
            {/* {!isLoading && isRefetching && <div className=" fixed bg-black-700/50 z-[999] h-screen w-screen top-0 start-0 end-0 bottom-0 flex items-center justify-center"><Spinner /></div>} */}

        </>
    );
}

export default Approvers;
