import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";

interface PropsTypes {
    totalPages: number;
    baseUrl: string;
}

const Double = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1.2em"
        width="1.2em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M17.59 18 19 16.59 14.42 12 19 7.41 17.59 6l-6 6z"></path>
        <path d="m11 18 1.41-1.41L7.83 12l4.58-4.59L11 6l-6 6z"></path>
    </svg>
);

const Single = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z"></path>
    </svg>
);

const buildPages = (
    current: number,
    total: number,
    siblingCount: number = 1
): (number | "dots")[] => {
    const totalNumbers = siblingCount * 2 + 5;
    if (total <= totalNumbers) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "dots")[] = [];
    const leftSibling = Math.max(current - siblingCount, 2);
    const rightSibling = Math.min(current + siblingCount, total - 1);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < total - 1;

    pages.push(1);

    if (showLeftDots) pages.push("dots");

    for (let page = leftSibling; page <= rightSibling; page++) {
        pages.push(page);
    }

    if (showRightDots) pages.push("dots");

    pages.push(total);

    return pages;
};

const Pagination = ({ totalPages, baseUrl = "/" }: PropsTypes) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const page = Number(params.get("page") || "1");

    const isFirstPage = page <= 1;
    const isLastPage = page >= totalPages;

    const pages = buildPages(page, totalPages);

    const baseBtn =
        "flex h-8 min-w-8 items-center justify-center rounded-md border border-[#29293a] text-xs px-2";
    const activeBtn = "bg-[#D4368E] border-transparent text-white";
    const normalBtn =
        "bg-black-800 text-[#E2E2F5] hover:bg-[#181827] hover:text-white";
    const disabledBtn = "opacity-40 pointer-events-none cursor-default";

    // IMPORTANT: baseUrl should already be the path, e.g. "/", "/approvers"
    const buildLink = (p: number) => `${baseUrl}?page=${p}`;

    return (
        <nav aria-label="Pagination" className="mt-5 flex justify-center">
            <ul className="flex items-center gap-2">
                {/* First */}
                <li>
                    <Link
                        to={buildLink(1)}
                        aria-label="First page"
                        className={clsx(
                            baseBtn,
                            normalBtn,
                            "text-[11px]",
                            isFirstPage && disabledBtn
                        )}
                    >
                        <Double />
                    </Link>
                </li>

                {/* Prev */}
                <li>
                    <Link
                        to={buildLink(Math.max(1, page - 1))}
                        aria-label="Previous page"
                        className={clsx(
                            baseBtn,
                            normalBtn,
                            "text-[11px]",
                            isFirstPage && disabledBtn
                        )}
                    >
                        <Single />
                    </Link>
                </li>

                {/* Pages */}
                {pages.map((item, idx) => {
                    if (item === "dots") {
                        return (
                            <li key={`dots-${idx}`}>
                                <span className="px-2 text-xs text-[#8888a5]">…</span>
                            </li>
                        );
                    }

                    const isActive = item === page;

                    return (
                        <li key={item}>
                            <Link
                                to={buildLink(item)}
                                className={clsx(baseBtn, isActive ? activeBtn : normalBtn)}
                            >
                                {item}
                            </Link>
                        </li>
                    );
                })}

                {/* Next */}
                <li>
                    <Link
                        to={buildLink(Math.min(totalPages, page + 1))}
                        aria-label="Next page"
                        className={clsx(
                            baseBtn,
                            normalBtn,
                            "rotate-180 text-[11px]",
                            isLastPage && disabledBtn
                        )}
                    >
                        <Single />
                    </Link>
                </li>

                {/* Last */}
                <li>
                    <Link
                        to={buildLink(totalPages)}
                        aria-label="Last page"
                        className={clsx(
                            baseBtn,
                            normalBtn,
                            "rotate-180 text-[11px]",
                            isLastPage && disabledBtn
                        )}
                    >
                        <Double />
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;

