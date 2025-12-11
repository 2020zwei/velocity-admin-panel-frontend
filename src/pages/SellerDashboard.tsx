import { Button } from "@/components/Button";
import DeleteModal from "@/components/DeleteModal";
import Pagination from "@/components/Pagination";
import TableActions from "@/components/TableActions";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sellers = [
  { id: 1, name: "Acme Corp", email: "John Reyes", territory: "Discovery", status: "Active" },
  { id: 2, name: "Acme Corp", email: "John Reyes", territory: "Working", status: "Active" },
  { id: 3, name: "Acme Corp", email: "John Reyes", territory: "Close/Won", status: "Active" },
  { id: 4, name: "Acme Corp", email: "John Reyes", territory: "Working", status: "Active" },
];

function SellerDashboard() {
  const [isDelete, setIsDelete] = useState(false);
  const navigate = useNavigate();
  const handleAction = (item: unknown, type: string) => {
    if (type === 'delete') {
      setIsDelete(true);
    }
    else if (type === 'edit') {
      navigate(`/seller/add`,{state:item})
    }
  }
  return (
    <>
      <div className="min-h-screen bg-black text-white flex">
        <section className="flex-1  bg-dark-default">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Sellers list</h1>

            <Button onClick={() => navigate('/seller/add')}>
              + Add Seller
            </Button>
          </div>
          <div className="bg-dark-default">
            <div className="rounded-md bg-black-900/40">
              {/* Scroll wrapper */}
              <div className="overflow-x-auto">
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
                      <th className="px-4 sm:px-6 py-3 text-left whitespace-nowrap">
                        Territory
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right rounded-r-md pr-4 sm:pr-6 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* Rows */}
                  <tbody>
                    {sellers.map((seller) => (
                      <tr
                        key={seller.id}
                        className="even:bg-black-800/60 text-white"
                      >
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          {seller.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          {seller.email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          {seller.territory}
                        </td>
                        <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-4">
                            <TableActions item={seller} onClick={handleAction} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                totalPages={20}
                baseUrl="/"
              />

            </div>
          </div>


        </section>
      </div>
      <DeleteModal
        isOpen={isDelete}
        onClose={() => setIsDelete(false)}
        onConfirm={() => setIsDelete(false)}
      />
    </>
  );
}

export default SellerDashboard;
