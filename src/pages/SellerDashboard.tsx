import { Button } from "@/components/Button";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";
import TableActions from "@/components/TableActions";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sales_reps = [
  {
    "id": 1,
    "name": "Haris Office",
    "email": "haris.saleem@zweidevs.com",
    "dealer_code": "2302",
    "territory_state": "CA",
    "zip_code": "90001",
    "keywords": [
      "helloo"
    ],
    "is_active": true,
    "created_at": "2025-12-12T10:57:07.835535Z",
    "updated_at": "2025-12-12T11:06:28.888164Z",
    "approver_ids": [
      2
    ]
  }
]

function SellerDashboard() {

  const [deleteItem, setDeleteItem] = useState<any>("");
  const navigate = useNavigate();
  const { data, isLoading, error, refetch: callApi } = useApi<{ results: any[] }>({
    url: `/sales-reps/${deleteItem?.id ?? ''}`,
    auto: deleteItem?.id ? false : true,
    method: deleteItem?.id ? "delete" : "get",
    transformResponse: (d) => d
  });
  const handleAction = (item: unknown, type: string) => {
    if (type === "delete") {
      setDeleteItem(item);
    } else if (type === "edit") {
      navigate(`/seller/add`, { state: item });
    }
  };

  const deleteRecored = async () => {
    setDeleteItem("")
    await callApi()
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white flex">
        <section className="flex-1 bg-dark-default min-w-0">
          <div className="sm:flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Sellers list</h1>
            <Button onClick={() => navigate("/seller/add")} className="sm:ms-0 ms-auto">
              + Add Seller
            </Button>
          </div>
          <div
            className="w-full overflow-x-auto rounded-md bg-black-900/40"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-gradient text-xs sm:text-sm md:text-base font-medium capitalize tracking-wide text-white">
                  <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap rounded-l-md">Seller Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Email</th>
                  <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">Territory</th>
                  <th className="px-4 sm:px-6 py-3 text-right rounded-r-md pr-4 sm:pr-6 whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sales_reps.map((item) => (
                  <tr key={item.id} className="even:bg-black-800/60 text-white">
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 sm:px-6 py-3 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.email}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{item.territory_state}</td>
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

          <div className="mt-4">
            <Pagination totalPages={20} baseUrl="/" />
          </div>
        </section>
      </div>

      <DeleteModal isOpen={deleteItem} onClose={() => setDeleteItem("")} onConfirm={deleteRecored} />
    </>
  );
}


export default SellerDashboard;
