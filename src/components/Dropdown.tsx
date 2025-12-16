// // import React, { useEffect, useRef, useState } from "react";
// // import Icon from "./Icon";
// // import clsx from "clsx";

// // export interface Option {
// //     lable: string;
// //     value: string | number;
// // }

// // interface ClassNames {
// //     trigger?: string;
// //     selectedOption?: string;
// //     option?: string;
// // }

// // interface DropdownProps {
// //     multiple?: boolean;
// //     options?: Option[];
// //     onSelect?: (value: Option["value"] | Option["value"][]) => void;
// //     value?: Option["value"] | Option["value"][];
// //     showSelected?: boolean;
// //     placeholder?: string;
// //     classNames?: ClassNames;
// // }

// // const Dropdown: React.FC<DropdownProps> = ({
// //     multiple = false,
// //     options = [],
// //     onSelect,
// //     value,
// //     classNames = {},
// //     showSelected = true,
// //     placeholder = "Select an option",
// // }) => {
// //     const [open, setOpen] = useState(false);
// //     const [openUpwards, setOpenUpwards] = useState(false);
// //     const [internalValue, setInternalValue] = useState<
// //         Option["value"] | Option["value"][] | undefined
// //     >(value);

// //     const containerRef = useRef<HTMLDivElement | null>(null);

// //     useEffect(() => setInternalValue(value), [value]);

// //     useEffect(() => {
// //         const handleClickOutside = (e: MouseEvent) => {
// //             if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
// //                 setOpen(false);
// //             }
// //         };
// //         if (open) document.addEventListener("mousedown", handleClickOutside);
// //         return () => document.removeEventListener("mousedown", handleClickOutside);
// //     }, [open]);

// //     useEffect(() => {
// //         if (!open || !containerRef.current) return;
// //         const rect = containerRef.current.getBoundingClientRect();
// //         setOpenUpwards(rect.top > window.innerHeight - rect.bottom);
// //     }, [open]);

// //     const currentValue = value !== undefined ? value : internalValue;

// //     const isSelected = (val: Option["value"]) => {
// //         if (currentValue == null) return false;
// //         return Array.isArray(currentValue) ? currentValue.includes(val) : currentValue === val;
// //     };

// //     const handleOptionClick = (val: Option["value"]) => {
// //         let next: Option["value"] | Option["value"][];

// //         if (multiple) {
// //             const prev = Array.isArray(currentValue) ? currentValue : [];
// //             next = prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val];
// //         } else {
// //             next = val;
// //             setOpen(false);
// //         }

// //         if (value === undefined) setInternalValue(next);
// //         onSelect?.(next);
// //     };

// //     const getDisplayLabel = () => {
// //         if (currentValue == null || (Array.isArray(currentValue) && currentValue.length === 0))
// //             return placeholder;

// //         const labels = (vals: Option["value"][]) =>
// //             vals
// //                 .map((v) => options.find((o) => o.value === v)?.lable)
// //                 .filter(Boolean)
// //                 .join(", ");

// //         if (Array.isArray(currentValue)) return labels(currentValue);

// //         return options.find((o) => o.value === currentValue)?.lable ?? placeholder;
// //     };

// //     return (
// //         <div className="relative w-full" ref={containerRef}>
// //             <button
// //                 type="button"
// //                 onClick={() => setOpen((p) => !p)}
// //                 className={clsx("flex items-center justify-between gap-3 transition w-full", classNames.trigger)}
// //             >
// //                 <div className="text-left flex-1">
// //                     <div
// //                         className={clsx(
// //                             "leading-tight whitespace-nowrap text-base",
// //                             currentValue == null || (Array.isArray(currentValue) && currentValue.length === 0)
// //                                 ? "text-gray-500"
// //                                 : "text-white"
// //                         )}
// //                     >
// //                         {getDisplayLabel()}
// //                     </div>
// //                 </div>
// //                 <span className={clsx("text-xs opacity-60 transition-transform duration-200", open && "rotate-180")}>
// //                     <Icon name="caret" />
// //                 </span>
// //             </button>

// //             {open && (
// //                 <div
// //                     className={clsx(
// //                         "absolute w-full right-0 p-2 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50 max-h-[200px] overflow-auto dark-scrollbar",
// //                         openUpwards ? "bottom-full mb-2" : "top-full mt-2"
// //                     )}
// //                 >
// //                     <div className="py-2 text-sm">
// //                         {options.map((opt) => {
// //                             const selected = isSelected(opt.value);
// //                             return (
// //                                 <button
// //                                     key={String(opt.value)}
// //                                     type="button"
// //                                     onClick={() => handleOptionClick(opt.value)}
// //                                     className={clsx(
// //                                         "w-full flex items-center rounded-md mb-1 py-3 justify-between px-3 text-white transition text-left",
// //                                         selected && showSelected ? classNames.selectedOption : "",
// //                                         classNames.option
// //                                     )}
// //                                 >
// //                                     <span className="truncate">{opt.lable}</span>
// //                                     {multiple && selected && (
// //                                         <span className="text-[11px] opacity-70">
// //                                             <Icon name="check" />
// //                                         </span>
// //                                     )}
// //                                 </button>
// //                             );
// //                         })}
// //                     </div>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default Dropdown;










// import React, { useEffect, useRef, useState } from "react";
// import clsx from "clsx";
// import Icon from "./Icon";

// /* ===================== TYPES ===================== */

// export interface Option {
//     lable: string;
//     value: string | number;
// }

// interface ClassNames {
//     trigger?: string;
//     selectedOption?: string;
//     option?: string;
// }

// type SingleValue = Option;
// type MultiValue = Option["value"][];

// interface DropdownProps {
//     multiple?: boolean;
//     options?: Option[];
//     onSelect?: (value: SingleValue | MultiValue) => void;
//     value?: SingleValue | MultiValue;
//     showSelected?: boolean;
//     placeholder?: string;
//     classNames?: ClassNames;
// }

// /* ===================== COMPONENT ===================== */

// const Dropdown: React.FC<DropdownProps> = ({
//     multiple = false,
//     options = [],
//     onSelect,
//     value,
//     classNames = {},
//     showSelected = true,
//     placeholder = "Select an option",
// }) => {
//     const [open, setOpen] = useState(false);
//     const [openUpwards, setOpenUpwards] = useState(false);
//     const [internalValue, setInternalValue] = useState<
//         SingleValue | MultiValue | undefined
//     >(value);

//     const containerRef = useRef<HTMLDivElement | null>(null);

//     /* ===================== EFFECTS ===================== */

//     useEffect(() => {
//         setInternalValue(value);
//     }, [value]);

//     useEffect(() => {
//         const handleClickOutside = (e: MouseEvent) => {
//             if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//                 setOpen(false);
//             }
//         };

//         if (open) document.addEventListener("mousedown", handleClickOutside);
//         return () => document.removeEventListener("mousedown", handleClickOutside);
//     }, [open]);

//     useEffect(() => {
//         if (!open || !containerRef.current) return;
//         const rect = containerRef.current.getBoundingClientRect();
//         setOpenUpwards(rect.top > window.innerHeight - rect.bottom);
//     }, [open]);

//     /* ===================== HELPERS ===================== */

//     const currentValue = value !== undefined ? value : internalValue;

//     const findOption = (val: Option["value"]) =>
//         options.find((o) => o.value === val);

//     const isSelected = (val: Option["value"]) => {
//         if (!currentValue) return false;

//         if (multiple && Array.isArray(currentValue)) {
//             return currentValue.includes(val);
//         }

//         if (!multiple && !Array.isArray(currentValue)) {
//             return currentValue.value === val;
//         }

//         return false;
//     };

//     /* ===================== HANDLERS ===================== */

//     const handleOptionClick = (val: Option["value"]) => {
//         let next: SingleValue | MultiValue;

//         if (multiple) {
//             const prev = Array.isArray(currentValue) ? currentValue : [];
//             next = prev.includes(val)
//                 ? prev.filter((v) => v !== val)
//                 : [...prev, val];
//         } else {
//             const option = findOption(val);
//             if (!option) return;

//             next = option;
//             setOpen(false);
//         }

//         if (value === undefined) {
//             setInternalValue(next);
//         }

//         onSelect?.(next);
//     };

//     const getDisplayLabel = () => {
//         if (!currentValue) return placeholder;

//         if (multiple && Array.isArray(currentValue)) {
//             if (currentValue.length === 0) return placeholder;

//             return currentValue
//                 .map((v) => findOption(v)?.lable)
//                 .filter(Boolean)
//                 .join(", ");
//         }

//         if (!multiple && !Array.isArray(currentValue)) {
//             return currentValue.lable;
//         }

//         return placeholder;
//     };

//     /* ===================== RENDER ===================== */

//     return (
//         <div className="relative w-full" ref={containerRef}>
//             <button
//                 type="button"
//                 onClick={() => setOpen((p) => !p)}
//                 className={clsx(
//                     "flex items-center justify-between gap-3 transition w-full",
//                     classNames.trigger
//                 )}
//             >
//                 <div className="text-left flex-1">
//                     <div
//                         className={clsx(
//                             "leading-tight whitespace-nowrap text-base",
//                             !currentValue ||
//                                 (Array.isArray(currentValue) && currentValue.length === 0)
//                                 ? "text-gray-500"
//                                 : "text-white"
//                         )}
//                     >
//                         {getDisplayLabel()}
//                     </div>
//                 </div>

//                 <span
//                     className={clsx(
//                         "text-xs opacity-60 transition-transform duration-200",
//                         open && "rotate-180"
//                     )}
//                 >
//                     <Icon name="caret" />
//                 </span>
//             </button>

//             {open && (
//                 <div
//                     className={clsx(
//                         "absolute w-full right-0 p-2 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50 max-h-[200px] overflow-auto dark-scrollbar",
//                         openUpwards ? "bottom-full mb-2" : "top-full mt-2"
//                     )}
//                 >
//                     <div className="py-2 text-sm">
//                         {options.map((opt) => {
//                             const selected = isSelected(opt.value);

//                             return (
//                                 <button
//                                     key={String(opt.value)}
//                                     type="button"
//                                     onClick={() => handleOptionClick(opt.value)}
//                                     className={clsx(
//                                         "w-full flex items-center rounded-md mb-1 py-3 justify-between px-3 hover:bg-blue-gradient duration-300 text-white transition text-left",
//                                         selected && showSelected
//                                             ? classNames.selectedOption
//                                             : "",
//                                         classNames.option
//                                     )}
//                                 >
//                                     <span className="truncate">{opt.lable}</span>

//                                     {multiple && selected && (
//                                         <span className="text-[11px] opacity-70">
//                                             <Icon name="check" />
//                                         </span>
//                                     )}
//                                 </button>
//                             );
//                         })}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Dropdown;

















import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Icon from "./Icon";

/* ===================== TYPES ===================== */

export interface Option {
    lable: string;
    value: string | number;
}

interface ClassNames {
    trigger?: string;
    selectedOption?: string;
    option?: string;
}

type SingleValue = Option;
type MultiValue = Option["value"][];

interface DropdownProps {
    multiple?: boolean;
    options?: Option[];
    onSelect?: (value: SingleValue | MultiValue) => void;
    value?: SingleValue | MultiValue;
    showSelected?: boolean;
    placeholder?: string;
    classNames?: ClassNames;

    // Infinite scroll hook
    onReachBottom?: () => void;
    bottomOffset?: number; // px before bottom to trigger

    // ✅ Guards
    isFetchingMore?: boolean; // true while loading next page
    hasMore?: boolean; // stop calling when no more pages
}

/* ===================== COMPONENT ===================== */

const Dropdown: React.FC<DropdownProps> = ({
    multiple = false,
    options = [],
    onSelect,
    value,
    classNames = {},
    showSelected = true,
    placeholder = "Select an option",

    onReachBottom,
    bottomOffset = 24,

    isFetchingMore = false,
    hasMore = true,
}) => {
    // Smooth open/close
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [openUpwards, setOpenUpwards] = useState(false);

    const [internalValue, setInternalValue] = useState<
        SingleValue | MultiValue | undefined
    >(value);

    const containerRef = useRef<HTMLDivElement | null>(null);

    // Scroll refs
    const listRef = useRef<HTMLDivElement | null>(null);
    const reachLockRef = useRef(false);

    // Guard ref to avoid stale state in scroll handler
    const isFetchingMoreRef = useRef(isFetchingMore);

    /* ===================== EFFECTS ===================== */

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    useEffect(() => {
        isFetchingMoreRef.current = isFetchingMore;

        // ✅ when fetch finishes, allow another trigger
        if (!isFetchingMore) {
            reachLockRef.current = false;
        }
    }, [isFetchingMore]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // compute direction when menu is mounted (so rect is accurate)
    useEffect(() => {
        if (!isMounted || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceAbove > spaceBelow);
    }, [isMounted]);

    // reset reach lock on open
    useEffect(() => {
        if (isOpen) reachLockRef.current = false;
    }, [isOpen]);

    // reset lock when items change (useful after appending in infinite scroll)
    useEffect(() => {
        reachLockRef.current = false;
    }, [options.length]);

    // Optional: if list isn't scrollable, trigger once on open (to load more)
    useEffect(() => {
        if (!isOpen || !onReachBottom) return;
        if (!hasMore || isFetchingMoreRef.current) return;

        requestAnimationFrame(() => {
            const el = listRef.current;
            if (!el) return;

            const notScrollable = el.scrollHeight <= el.clientHeight;
            if (notScrollable && !reachLockRef.current) {
                reachLockRef.current = true;
                onReachBottom();
            }
        });
    }, [isOpen, onReachBottom, hasMore]);

    /* ===================== HELPERS ===================== */

    const currentValue = value !== undefined ? value : internalValue;

    const findOption = (val: Option["value"]) =>
        options.find((o) => o.value === val);

    const isSelected = (val: Option["value"]) => {
        if (!currentValue) return false;

        if (multiple && Array.isArray(currentValue)) {
            return currentValue.includes(val);
        }

        if (!multiple && !Array.isArray(currentValue)) {
            return currentValue.value === val;
        }

        return false;
    };

    const getDisplayLabel = () => {
        if (!currentValue) return placeholder;

        if (multiple && Array.isArray(currentValue)) {
            if (currentValue.length === 0) return placeholder;

            return currentValue
                .map((v) => findOption(v)?.lable)
                .filter(Boolean)
                .join(", ");
        }

        if (!multiple && !Array.isArray(currentValue)) {
            return currentValue.lable;
        }

        return placeholder;
    };

    /* ===================== HANDLERS ===================== */

    const close = () => setIsOpen(false);

    const toggle = () => {
        if (isOpen) return close();

        // mount first, then open on next frame so transition runs
        setIsMounted(true);
        requestAnimationFrame(() => setIsOpen(true));
    };

    const handleOptionClick = (val: Option["value"]) => {
        let next: SingleValue | MultiValue;

        if (multiple) {
            const prev = Array.isArray(currentValue) ? currentValue : [];
            next = prev.includes(val)
                ? prev.filter((v) => v !== val)
                : [...prev, val];
        } else {
            const option = findOption(val);
            if (!option) return;

            next = option;
            close();
        }

        if (value === undefined) setInternalValue(next);
        onSelect?.(next);
    };

    const handleScroll = () => {
        const el = listRef.current;
        if (!el || !onReachBottom) return;

        if (!hasMore) return;
        if (isFetchingMoreRef.current) return; // ✅ guard

        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - bottomOffset;

        if (nearBottom && !reachLockRef.current) {
            reachLockRef.current = true; // lock until fetch finishes
            onReachBottom();
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                className={clsx(
                    "flex items-center justify-between gap-3 transition w-full",
                    classNames.trigger
                )}
            >
                <div className="text-left flex-1">
                    <div
                        className={clsx(
                            "leading-tight whitespace-nowrap text-base",
                            !currentValue ||
                                (Array.isArray(currentValue) && currentValue.length === 0)
                                ? "text-gray-500"
                                : "text-white"
                        )}
                    >
                        {getDisplayLabel()}
                    </div>
                </div>

                <span
                    className={clsx(
                        "text-xs opacity-60 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                >
                    <Icon name="caret" />
                </span>
            </button>

            {/* keep mounted while closing, unmount after transition */}
            {isMounted && (
                <div
                    onTransitionEnd={(e) => {
                        if (!isOpen && e.propertyName === "opacity") setIsMounted(false);
                    }}
                    className={clsx(
                        "absolute w-full right-0 p-2 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50",
                        "transform-gpu transition-[opacity,transform] duration-200 ease-out",
                        isOpen
                            ? "opacity-100 scale-100 pointer-events-auto"
                            : "opacity-0 scale-95 pointer-events-none",
                        openUpwards ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
                    )}
                >
                    <div
                        ref={listRef}
                        onScroll={handleScroll}
                        className="max-h-[200px] overflow-auto dark-scrollbar py-2 text-sm"
                    >
                        {options.map((opt) => {
                            const selected = isSelected(opt.value);

                            return (
                                <button
                                    key={String(opt.value)}
                                    type="button"
                                    onClick={() => handleOptionClick(opt.value)}
                                    className={clsx(
                                        "w-full flex items-center rounded-md py-3 hover:bg-blue-gradient duration-300 justify-between px-3 text-white transition text-left",
                                        selected && showSelected ? classNames.selectedOption : "",
                                        classNames.option
                                    )}
                                >
                                    <span className="truncate">{opt.lable}</span>

                                    {multiple && selected && (
                                        <span className="text-[11px] opacity-70">
                                            <Icon name="check" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Optional: show loading state at bottom */}
                    {onReachBottom && hasMore && (
                        <div className="px-3 pb-2 pt-1 text-xs text-white/60">
                            {isFetchingMore ? "Loading more..." : ""}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
