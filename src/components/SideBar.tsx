import clsx from "clsx";
import { NavLink, useLocation } from "react-router-dom";

const navItemBase =
    "w-full text-left px-6 py-3 flex items-center gap-2 rounded border-l-4 transition";

const makeNavClass = (isActive: boolean) =>
    clsx(
        navItemBase,
        isActive
            ? "bg-[#1D1D28] border-[#D4368E]"
            : "border-transparent hover:border-[#D4368E] hover:bg-[#15172a]"
    );

const makeLabelClass = (isActive: boolean) =>
    clsx(
        "font-semibold",
        isActive
            ? "bg-text-gradient bg-clip-text text-transparent"
            : "text-slate-200"
    );

const SideBar = () => {
    const location = useLocation();

    const navItems = [
        {
            label: "Sales Agent",
            to: "/",
            end: true,
        },
        {
            label: "Approvers",
            to: "/approvers",
            end: false,
        },
    ];

    const isSalesAgentExtraActive =
        location.pathname === "/seller/add" ||
        location.pathname === "/seller/upload";

    return (
        <div className="mt-6 px-[14px] flex-1 flex flex-col gap-1 w-[273px]">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => {
                        const effectiveActive =
                            item.label === "Sales Agent"
                                ? isActive || isSalesAgentExtraActive
                                : isActive;

                        return makeNavClass(effectiveActive);
                    }}
                >
                    {({ isActive }) => {
                        const effectiveActive =
                            item.label === "Sales Agent"
                                ? isActive || isSalesAgentExtraActive
                                : isActive;

                        return (
                            <span className={makeLabelClass(effectiveActive)}>
                                {item.label}
                            </span>
                        );
                    }}
                </NavLink>
            ))}
        </div>
    );
};

export default SideBar;
