
import AddApproverModal from "@/components/AddApproverModal";
import { Button } from "@/components/Button";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";
import TableActions from "@/components/TableActions";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import { useLocation } from "react-router-dom";


function Approvers() {
    const { search } = useLocation()
    const [deleteItem, setDeleteItem] = useState<any>(0);
    const [isApproverModal, setIsApproverModal] = useState<any>("");
    const page = search.slice(search.lastIndexOf("=") + 1)
    const { data: apvData, isLoading, refetch, isRefetching } = useApi({
        url: `/approvers?page=${page ? page : 1}&&page_size=20`,
        auto: true,
        method: "get",
        transformResponse: (d) => d
    });


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
    if (isLoading) {
        return <div className=" fixed bg-black-700/50 z-[999] h-screen w-screen top-0 start-0 end-0 bottom-0 flex items-center justify-center"><Spinner /></div>
    }
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

                    {!approvers?.length ? <div className="text-center text-lg">Approvers not found</div> :
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
                                                Seller Name
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
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 &&
                                <Pagination
                                    totalPages={totalPages}
                                    baseUrl="/approvers"
                                />}
                        </>}

                </section>
            </div>
            <DeleteModal
                url="approvers"
                isOpen={deleteItem}
                onClose={() => setDeleteItem(false)}
                onConfirm={onDeleteConfirm}
            />
            <AddApproverModal
                isOpen={isApproverModal}
                onClose={() => { setIsApproverModal("") }}
                onConfirm={onConfirm}
            />
            {!isLoading && isRefetching && <div className=" fixed bg-black-700/50 z-[999] h-screen w-screen top-0 start-0 end-0 bottom-0 flex items-center justify-center"><Spinner /></div>}

        </>
    );
}

export default Approvers;
