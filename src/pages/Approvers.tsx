
import AddApproverModal from "@/components/AddApproverModal";
import { Button } from "@/components/Button";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";
import TableActions from "@/components/TableActions";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";

const approvers = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@approver.com",
        "is_active": true,
        "created_at": "2025-12-11T10:08:08.363892Z",
        "updated_at": "2025-12-11T10:08:08.363908Z"
    }
]

function Approvers() {
    const [deleteItem, setDeleteItem] = useState<any>("");
    const [isApproverModal, setIsApproverModal] = useState<any>("");

    const { isLoading, refetch: deleteData } = useApi<{ results: any[] }>({
        url: `/approvers/${deleteItem?.id ?? ''}`,
        auto: deleteItem?.id ? false : true,
        method: deleteItem?.id ? "delete" : "get",
        transformResponse: (d) => d
    });

    const handleAction = (item: unknown, type: string) => {
        if (type === 'delete') {
            setDeleteItem(item);
        }
        else if (type === "edit") {
            setIsApproverModal(item)
        }
    }

    const deleteRecored = async () => {
        setDeleteItem("")
        await deleteData()
    }
    if (isLoading) {
        return <Spinner />
    }
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
                                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
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
                    <Pagination
                        totalPages={20}
                        baseUrl="/approvers"
                    />


                </section>
            </div>
            <DeleteModal
                isOpen={deleteItem}
                onClose={() => setDeleteItem(false)}
                onConfirm={deleteRecored}
            />
            <AddApproverModal
                isOpen={isApproverModal}
                onClose={() => { setIsApproverModal("") }}
                onConfirm={() => setIsApproverModal("")}
            />

        </>
    );
}

export default Approvers;
