import React, { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import clsx from "clsx";

interface ClassNames {
    trigger?: string;
    selectedOption?: string;
    option?: string;
}

interface DropdownProps {
    multiple?: boolean;
    options?: string[];                          // labels of options
    onSelect?: (option: string | string[]) => void;
    value?: string | string[];                   // controlled value
    showSelected?: boolean;   
    placeholder?: string;
    classNames?: ClassNames;
}

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
    const [openUpwards, setOpenUpwards] = useState(false); // <-- new
    const [internalValue, setInternalValue] = useState<string | string[] | undefined>(value);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // keep internal value in sync with controlled value
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    // close when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

    // decide whether to open upwards or downwards based on available space
    useEffect(() => {
        if (!open || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // If there is more space above than below, open upwards
        setOpenUpwards(spaceAbove > spaceBelow);
    }, [open]);

    const currentValue = value !== undefined ? value : internalValue;

    const isOptionSelected = (option: string): boolean => {
        if (!currentValue) return false;
        if (Array.isArray(currentValue)) return currentValue.includes(option);
        return currentValue === option;
    };

    const handleOptionClick = (option: string) => {
        let nextValue: string | string[];

        if (multiple) {
            const prev = Array.isArray(currentValue) ? currentValue : [];
            if (prev.includes(option)) {
                nextValue = prev.filter((o) => o !== option);
            } else {
                nextValue = [...prev, option];
            }
        } else {
            nextValue = option;
            setOpen(false);
        }

        // if not controlled, update local state
        if (value === undefined) {
            setInternalValue(nextValue);
        }

        onSelect?.(nextValue);
    };

    const getDisplayLabel = () => {
        if (!currentValue || (Array.isArray(currentValue) && currentValue.length === 0)) {
            return placeholder;
        }
        if (Array.isArray(currentValue)) {
            return currentValue.join(", ");
        }
        return currentValue;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={clsx(
                    "flex items-center justify-between gap-3 transition w-full",
                    classNames.trigger
                )}
            >
                <div className="text-left flex-1">
                    <div
                        className={`leading-tight whitespace-nowrap text-base ${!currentValue || (Array.isArray(currentValue) && currentValue.length === 0)
                            ? "text-gray-500"
                            : "text-white"
                            }`}
                    >
                        {getDisplayLabel()}
                    </div>
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
                <div
                    className={clsx(
                        "absolute w-full right-0 p-2 rounded-xl border border-[#1f2233] bg-[#090A12] shadow-lg shadow-black/40 z-50 max-h-[200px] overflow-auto dark-scrollbar",
                        openUpwards ? "bottom-full mb-2" : "top-full mt-2"
                    )}
                >
                    <div className="py-2 text-sm">
                        {options.map((opt) => {
                            const selected = isOptionSelected(opt);

                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleOptionClick(opt)}
                                    className={clsx(
                                        "w-full flex items-center rounded-md mb-1 py-3 justify-between px-3 text-white transition text-left",
                                        selected && showSelected ? classNames.selectedOption : "",
                                        classNames.option
                                    )}
                                >
                                    <span className="truncate">{opt}</span>
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
