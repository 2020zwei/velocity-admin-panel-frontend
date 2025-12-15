// import React, { useEffect, useRef, useState } from "react";
// import Icon from "./Icon";
// import clsx from "clsx";

// export interface Option {
//     lable: string;
//     value: string | number;
// }

// interface ClassNames {
//     trigger?: string;
//     selectedOption?: string;
//     option?: string;
// }

// interface DropdownProps {
//     multiple?: boolean;
//     options?: Option[];
//     onSelect?: (value: Option["value"] | Option["value"][]) => void;
//     value?: Option["value"] | Option["value"][];
//     showSelected?: boolean;
//     placeholder?: string;
//     classNames?: ClassNames;
// }

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
//         Option["value"] | Option["value"][] | undefined
//     >(value);

//     const containerRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => setInternalValue(value), [value]);

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

//     const currentValue = value !== undefined ? value : internalValue;

//     const isSelected = (val: Option["value"]) => {
//         if (currentValue == null) return false;
//         return Array.isArray(currentValue) ? currentValue.includes(val) : currentValue === val;
//     };

//     const handleOptionClick = (val: Option["value"]) => {
//         let next: Option["value"] | Option["value"][];

//         if (multiple) {
//             const prev = Array.isArray(currentValue) ? currentValue : [];
//             next = prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val];
//         } else {
//             next = val;
//             setOpen(false);
//         }

//         if (value === undefined) setInternalValue(next);
//         onSelect?.(next);
//     };

//     const getDisplayLabel = () => {
//         if (currentValue == null || (Array.isArray(currentValue) && currentValue.length === 0))
//             return placeholder;

//         const labels = (vals: Option["value"][]) =>
//             vals
//                 .map((v) => options.find((o) => o.value === v)?.lable)
//                 .filter(Boolean)
//                 .join(", ");

//         if (Array.isArray(currentValue)) return labels(currentValue);

//         return options.find((o) => o.value === currentValue)?.lable ?? placeholder;
//     };

//     return (
//         <div className="relative w-full" ref={containerRef}>
//             <button
//                 type="button"
//                 onClick={() => setOpen((p) => !p)}
//                 className={clsx("flex items-center justify-between gap-3 transition w-full", classNames.trigger)}
//             >
//                 <div className="text-left flex-1">
//                     <div
//                         className={clsx(
//                             "leading-tight whitespace-nowrap text-base",
//                             currentValue == null || (Array.isArray(currentValue) && currentValue.length === 0)
//                                 ? "text-gray-500"
//                                 : "text-white"
//                         )}
//                     >
//                         {getDisplayLabel()}
//                     </div>
//                 </div>
//                 <span className={clsx("text-xs opacity-60 transition-transform duration-200", open && "rotate-180")}>
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
//                                         "w-full flex items-center rounded-md mb-1 py-3 justify-between px-3 text-white transition text-left",
//                                         selected && showSelected ? classNames.selectedOption : "",
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
}) => {
    const [open, setOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [internalValue, setInternalValue] = useState<
        SingleValue | MultiValue | undefined
    >(value);

    const containerRef = useRef<HTMLDivElement | null>(null);

    /* ===================== EFFECTS ===================== */

    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
        if (!open || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setOpenUpwards(rect.top > window.innerHeight - rect.bottom);
    }, [open]);

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

    /* ===================== HANDLERS ===================== */

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
            setOpen(false);
        }

        if (value === undefined) {
            setInternalValue(next);
        }

        onSelect?.(next);
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

    /* ===================== RENDER ===================== */

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
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
                        open && "rotate-180"
                    )}
                >
                    <Icon name="caret" />
                </span>
            </button>

            {open && (
                <div
                    className={clsx(
                        "absolute w-full right-0 p-2 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50 max-h-[200px] overflow-auto dark-scrollbar",
                        openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                    )}
                >
                    <div className="py-2 text-sm">
                        {options.map((opt) => {
                            const selected = isSelected(opt.value);

                            return (
                                <button
                                    key={String(opt.value)}
                                    type="button"
                                    onClick={() => handleOptionClick(opt.value)}
                                    className={clsx(
                                        "w-full flex items-center rounded-md mb-1 py-3 justify-between px-3 text-white transition text-left",
                                        selected && showSelected
                                            ? classNames.selectedOption
                                            : "",
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
                </div>
            )}
        </div>
    );
};

export default Dropdown;
