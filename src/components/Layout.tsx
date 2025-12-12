import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import SideBar from "./SideBar";
import clsx from "clsx";
import { useWindowSize } from "@/hooks/useResponsive";


const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const { width } = useWindowSize();
  if (width > 1290 && isSidebarOpen) {
    setIsSidebarOpen(false);
  }

  const handleClose=(e:any)=>{
    if(e.target.tagName==="ASIDE"){
       setIsSidebarOpen(false);
    }
  }

  useEffect(() => {
    if (width < 1290 && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [navigate]);


  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <header className={clsx("fixed w-full z-50 h-16 border-b bg-black-800 border-[#151623] flex items-center justify-between sm:px-8 px-2 bg-dark-800")}>
        <Header isSidebarOpen={isSidebarOpen} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </header>

      {/* Fixed Sidebar */}
      <aside className={clsx("fixed z-[60] top-16 left-0 bottom-0 lg-xl:w-fit", isSidebarOpen?"active-sidebar w-full":"")} onClick={handleClose}>
        <div className={clsx("fixed top-16 left-0 bottom-0 bg-black-800 border-r border-[#151623] flex flex-col duration-500 lg-xl:translate-x-0 -translate-x-[400px]", isSidebarOpen ? "!translate-x-0" : "")}>
          <SideBar />
        </div>
      </aside>

      {/* Main Content (scrollable) */}
      <main className={clsx("md:pt-16 pt-24 p-4 pe-2 min-h-screen max-w-[1600px] mx-auto duration-500 lg-xl:ps-[280px] ps-2", isSidebarOpen ? "!ps-[0px]" : "")}>
        <div className="sm:p-8 px-2 overflow-auto">

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
