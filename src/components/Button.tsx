// src/components/ui/PrimaryButton.tsx
import clsx from "clsx";
import * as React from "react";
import Spinner from "./Spinner";

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
interface ButtonProps extends PrimaryButtonProps {
    bgClass?: string;
    isLoading?: boolean,
    spinnerSize?:number
}

export function Button({ className, children, onClick, bgClass = 'bg-blue-gradient', isLoading = false,spinnerSize=32, ...props }: ButtonProps) {
    const btnRef = React.useRef<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = btnRef.current;
        if (button) {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            // Remove old ripple if still there
            const oldRipple = button.querySelector(".btn-ripple");
            if (oldRipple) oldRipple.remove();

            const ripple = document.createElement("span");
            ripple.className = "btn-ripple";
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            button.appendChild(ripple);

            ripple.addEventListener("animationend", () => {
                ripple.remove();
            });
        }

        // Call user's onClick
        onClick?.(event);
    };

    return (
        <button
            ref={btnRef}
            {...props}
            disabled={isLoading}
            onClick={handleClick}
            className={clsx(
                "relative overflow-hidden  flex items-center justify-center h-11 min-w-[146px] px-3 py-[11px] rounded-md text-sm font-semibold shadow-lg",
                "transition-all duration-150 ease-out",
                "hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                className,
                bgClass
            )}
        >
            {isLoading ? <Spinner size={20}/> : children}

        </button>
    );
}
