import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";
import clsx from "clsx";
import { useWindowSize } from "@/hooks/useResponsive";


const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate=useNavigate();
  const { width } = useWindowSize();
  if (width > 1290 && isSidebarOpen) {
    setIsSidebarOpen(false);
  }

  useEffect(() => {
    if (width < 1290) {
      setIsSidebarOpen(false);
    }
  }, [navigate]);


  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <header className={clsx("fixed w-full z-50 h-16 border-b bg-black-800 border-[#151623] flex items-center justify-between px-8 bg-dark-800")}>
        <Header isSidebarOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </header>

      {/* Fixed Sidebar */}
      <aside className={clsx("fixed top-16 left-0 bottom-0 w-[273px] bg-black-800 border-r border-[#151623] flex flex-col duration-500 lg-xl:translate-x-0 -translate-x-[400px]", isSidebarOpen ? "!translate-x-0" : "")}>
        <SideBar/>
      </aside>

      {/* Main Content (scrollable) */}
      <main className={clsx("pt-16 p-4 pe-2 min-h-screen max-w-[1600px] mx-auto duration-500 lg-xl:ps-[280px] ps-2", isSidebarOpen ? "!ps-[0px]" : "")}>
        <div className="px-8 py-8">

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
