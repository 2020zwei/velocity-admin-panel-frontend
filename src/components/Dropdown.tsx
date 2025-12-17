import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Icon from "./Icon";
import Spinner from "./Spinner";


export interface Option {
    label: string;
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
    isSearch?: boolean;
    totalPages?: number
    onReachBottom?: (page: number) => void;
    onChange?: (value: string) => void;
    bottomOffset?: number;
    isFetchingMore?: boolean;
    showSelectedList?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({
    multiple = false,
    options = [],
    onSelect,
    value,
    classNames = {},
    showSelected = true,
    placeholder = "Select an option",
    onChange,
    onReachBottom,
    bottomOffset = 24,
    isSearch = false,
    totalPages = 1,
    isFetchingMore = false,
    showSelectedList = false
}) => {

    const [items, setItems] = useState<Option[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [internalValue, setInternalValue] = useState<
        SingleValue | MultiValue | undefined
    >(value);
    const [search, setSearch] = useState("");

    const containerRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);
    const pageRef = useRef(1)
    const reachLockRef = useRef(false);
    const isFetchingMoreRef = useRef(isFetchingMore);
    const ignoreNextScrollRef = useRef(false);
    const prevLenRef = useRef(options.length);
    const oldOptions = useRef<Option[]>([])


    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    useEffect(() => {
        isFetchingMoreRef.current = isFetchingMore;
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
    useEffect(() => {
        if (!isMounted || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceAbove > spaceBelow);
    }, [isMounted]);
    useEffect(() => {
        if (isOpen) reachLockRef.current = false;
    }, [isOpen]);
    useEffect(() => {
        const prev = prevLenRef.current;
        const next = options.length;
        ignoreNextScrollRef.current = true;
        requestAnimationFrame(() => {
            ignoreNextScrollRef.current = false;
        });

        if (next > prev) {
            reachLockRef.current = false;
        }
        oldOptions.current = options
        setItems(options)

        prevLenRef.current = next;
    }, [options.length]);

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
                .map((v) => findOption(v)?.label)
                .filter(Boolean)
                .join(", ");
        }

        if (!multiple && !Array.isArray(currentValue)) {
            return currentValue.label;
        }

        return placeholder;
    };
    const close = () => setIsOpen(false);

    const toggle = () => {
        if (isOpen) return close();
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
        if (ignoreNextScrollRef.current) return;

        const el = listRef.current;
        if (!el || !onReachBottom) return;

        if (totalPages === pageRef.current) return;
        if (isFetchingMoreRef.current) return;

        const nearBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - bottomOffset;

        if (nearBottom && !reachLockRef.current) {
            reachLockRef.current = true;
            pageRef.current = pageRef.current + 1
            onReachBottom(pageRef.current);
            setSearch('')
        }
    };


    const handleSearchChange = (val: string) => {
        setSearch(val);
        ignoreNextScrollRef.current = true;
        requestAnimationFrame(() => {
            ignoreNextScrollRef.current = false;
        });
        reachLockRef.current = false;
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
        if (!onReachBottom) {
            const filtered = [...oldOptions.current].filter(el => el.label.toLowerCase().trim().includes(val.toLowerCase().trim()))
            if (filtered.length) {
                setItems(filtered)
            }
            if (val && !filtered.length) {
                setItems([])
            }

            if (val == '') {
                setItems(oldOptions.current)
            }
        }
        else {
            if (!val) {
                pageRef.current = 1
            }
            onChange?.(val)
        }
    };

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
                <div className="text-left flex-1 max-w-[95%] overflow-x-auto dark-scrollbar">
                    <div
                        className={clsx(
                            "leading-tight whitespace-nowrap text-base",
                            !currentValue ||
                                (Array.isArray(currentValue) && currentValue.length === 0)
                                ? "text-gray-500"
                                : "text-white"
                        )}
                    >
                        {showSelectedList ? placeholder : getDisplayLabel()}
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
                {isFetchingMore && <span><Spinner size={20} /></span>}
            </button>

            {multiple && showSelectedList && Array.isArray(currentValue) && currentValue.length ?
                <ul className="flex flex-wrap gap-x-2 gap-y-6 mt-6">
                    {
                        options.map((opt, index) => {
                            return currentValue.includes(opt.value) ?
                                <li key={index} className="w-max border border-[#1f2233] rounded-full text-xs py-1 px-2 relative">{opt.label}<button  onClick={() => handleOptionClick(opt.value)} type="button" className="absolute -top-3 -end-1 text-red-500 border-[#EE2B93] border rounded-full w-4 h-4 flex items-center justify-center">x</button></li>
                                : null
                        })}
                </ul> : null
            }

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
                        openUpwards
                            ? "bottom-full mb-2 origin-bottom"
                            : "top-full mt-2 origin-top"
                    )}
                >
                    {isSearch && (
                        <div>
                            <input
                                autoFocus={true}
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent w-full p-2 rounded-lg border border-[#1f2233] text-white"
                            />
                        </div>
                    )}

                    <div
                        ref={listRef}
                        onScroll={handleScroll}
                        className="max-h-[200px] overflow-auto dark-scrollbar py-2 text-sm"
                    >
                        {items.map((opt,index) => {
                            const selected = isSelected(opt.value);

                            return (
                                <button
                                    key={"list-"+String(index)}
                                    type="button"
                                    onClick={() => handleOptionClick(opt.value)}
                                    className={clsx(
                                        "w-full flex items-center rounded-md py-2 mb-1 hover:bg-blue-gradient duration-300 justify-between px-3 text-white transition text-left",
                                        selected && showSelected ? classNames.selectedOption : "",
                                        classNames.option
                                    )}
                                >
                                    <span className="truncate">{opt.label}</span>

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
                    {(onReachBottom && pageRef.current <= totalPages && totalPages > 1) && (
                        <div className="px-3 pb-2 pt-1 text-xs text-white/60">
                            {isFetchingMore ? "Loading more..." : ""}
                        </div>
                    )}

                    {!items.length && (
                        <div className="text-center pb-2 text-sm text-white/70">
                            Not found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
