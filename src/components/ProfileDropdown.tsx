import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useApi } from "@/hooks/useApi";
import { ShimmerWave } from "./TableShimmerRow";


const ProfileDropdown = () => {
    const { data: user, isLoading } = useApi({
        url: `/me/`,
        auto: true,
        transformResponse: (d) => d?.data?.profile
    });
    const [open, setOpen] = useState(false);
    const containerRef = useRef<any>(null);
    const navigate = useNavigate()
    const initials = (user?.name || "U")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase() || "")
        .join("") || "U";

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
        isLoading ? <ShimmerWave className="w-28" /> :
            <div className="relative" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-full px-3 py-1.5 hover:bg-[#141324] transition"
                >
                    <div className="w-9 h-9 rounded-full bg-blue-gradient flex items-center justify-center text-xs font-semibold overflow-hidden">
                        {user?.profile_picture ? (
                            <img src={user?.profile_picture} alt="profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center text-white">
                                {user?.name ? initials : <Icon name="user" />}
                            </div>
                        )}
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
                {open && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50">
                        <div className="h-1 w-full bg-blue-gradient rounded-t-xl" />

                        <div className="py-2">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/profile");
                                }}
                                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-[#141324] transition"
                            >
                                Profile
                            </button>
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
