import React, { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import profile from "../assets/profile.png";

const ProfileDropdown = () => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<any>(null);
    useEffect(() => {
        function handleClickOutside(e:any) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full px-3 py-1.5 hover:bg-[#141324] transition"
            >
                <div className="w-9 h-9 rounded-full bg-blue-gradient flex items-center justify-center text-xs font-semibold">
                    <img src={profile} alt="profile" className="w-full h-full object-cover"/>
                </div>
                <div className="text-left md:block hidden">
                    <div className="font-medium leading-tight whitespace-nowrap">Johny Larsen</div>
                </div>
                <span
                    className={`text-xs opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                >
                    <Icon name="caret"/>
                </span>
            </button>

            {/* Dropdown menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50">
                    {/* Top gradient accent */}
                    <div className="h-1 w-full bg-blue-gradient rounded-t-xl" />

                    <div className="py-2 text-sm">
                        <div className="px-3 pb-2 border-b border-[#1f2233] mb-1">
                            <div className="font-medium text-[13px]">Johny Larsen</div>
                            <div className="text-[11px] text-gray-400 truncate">
                                johny.larsen@example.com
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-between px-3 py-2 text-gray-200 hover:bg-[#15172A] transition">
                            <span>View profile</span>
                        </button>
                        <button className="w-full flex items-center justify-between px-3 py-2 text-gray-200 hover:bg-[#15172A] transition">
                            <span>Account settings</span>
                        </button>
                        <button className="w-full flex items-center justify-between px-3 py-2 text-gray-200 hover:bg-[#15172A] transition">
                            <span>Theme</span>
                            <span className="text-[11px] text-gray-400">Dark</span>
                        </button>

                        <div className="mt-1 pt-1 border-t border-[#1f2233]">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-red-400 hover:bg-[#271018] hover:text-red-300 transition">
                                <span>Sign out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
