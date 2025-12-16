import { Button } from "@/components/Button";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";
import TableActions from "@/components/TableActions";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


function SellerDashboard() {
  const { search } = useLocation()
  const [deleteItem, setDeleteItem] = useState<any>("");
  const navigate = useNavigate();
  const page = search.slice(search.lastIndexOf("=") + 1)
  const { data, isLoading, refetch: callApi } = useApi({
    url: `/sales-reps?page=${page ? page : 1}&&page_size=20`,
    auto: true,
    method: "get",
    transformResponse: (d) => d
  });
  const handleAction = (item: any, type: string) => {
    if (type === "delete") {
      setDeleteItem(item?.id);
    } else if (type === "edit") {
      navigate(`/seller/add?edit-id=${item.id}`, { state: item, replace: true });
    }
  };

  const onConfirm = async () => {
    await callApi()
    setDeleteItem('')
  }

  if (isLoading) {
    return <Spinner />
  }
  const sales_reps: any[] = data?.results?.data?.sales_reps ?? []
  const totalPages = Math.ceil(data?.count / 20)
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
          {(!sales_reps?.length) ? <div className="text-center text-lg">Seles reps not found</div> : <>
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
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap capitalize">{item.name}</td>
                      <td className="px-4 sm:px-6 py-3 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.email}
                      </td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap capitalize">{item.territory_state}</td>
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
              <div className="mt-4">
                <Pagination totalPages={totalPages} baseUrl="/" />
              </div>
            }
          </>
          }
        </section>
      </div>

      <DeleteModal url="sales-reps" isOpen={deleteItem} onClose={() => setDeleteItem("")} onConfirm={onConfirm} />
    </>
  );
}


export default SellerDashboard;
