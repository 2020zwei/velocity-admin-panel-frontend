import React, { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import profile from "../assets/profile.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useApi } from "@/hooks/useApi";


const ProfileDropdown = () => {
    const { data: user, isLoading } = useApi({
        url: `/me/`,
        auto: true,
        transformResponse: (d) => d?.data?.profile
    });
    const [open, setOpen] = useState(false);
    const containerRef = useRef<any>(null);
    const navigate = useNavigate()

    const logout = () => {
        Cookies.remove("access_token", {
            secure: import.meta.env.PROD,
            sameSite: "strict",
        });
        navigate("/login", { replace: true });
    };


    useEffect(() => {
        function handleClickOutside(e: any) {
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
                <div className="w-9 h-9 rounded-full bg-blue-gradient flex items-center justify-center text-xs font-semibold overflow-hidden">
                    <img src={user?.profile_picture} alt="profile" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="text-left md:block hidden">
                    <div className="font-medium leading-tight whitespace-nowrap">{user?.name}</div>
                </div>
                <span
                    className={`text-xs opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                >
                    <Icon name="caret" />
                </span>
            </button>

            {/* Dropdown menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50">
                    {/* Top gradient accent */}
                    <div className="h-1 w-full bg-blue-gradient rounded-t-xl" />

                    <div className="py-2">
                        <div className="mt-1 pt-1 border-t border-[#1f2233]">
                            <button onClick={logout} className="w-full flex items-center justify-between px-3 py-2 font-semibold bg-text-gradient bg-clip-text text-transparent hover:bg-[#271018] hover:opacity-80 transition">
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
