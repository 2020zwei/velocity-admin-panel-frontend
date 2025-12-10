// src/components/ui/Modal.tsx
import React, { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

const MODAL_ROOT_ID = "app-modal-root";

function getOrCreateModalRoot() {
    if (typeof document === "undefined") return null;

    let root = document.getElementById(MODAL_ROOT_ID);
    if (!root) {
        root = document.createElement("div");
        root.id = MODAL_ROOT_ID;
        document.body.appendChild(root);
    }
    return root;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;

    children?: ReactNode;

    /** Disable closing when clicking outside */
    disableOutsideClick?: boolean;

    /** Disable closing on Escape key */
    disableEsc?: boolean;

    /** Prevent background scroll when modal is open (default: true) */
    preventScroll?: boolean;

    /** Extra classes for the overlay */
    overlayClassName?: string;

    /** Extra classes for the modal content */
    contentClassName?: string;

    /** ARIA attributes (optional if you handle them inside children) */
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    disableOutsideClick = false,
    disableEsc = false,
    preventScroll = true,
    overlayClassName,
    contentClassName,
    ariaLabelledBy,
    ariaDescribedBy,
}) => {
    const [mounted, setMounted] = React.useState(false);
    const modalRoot = getOrCreateModalRoot();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent background scroll
    useEffect(() => {
        if (!isOpen || !preventScroll) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, preventScroll]);

    // Close on ESC
    useEffect(() => {
        if (!isOpen || disableEsc) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, disableEsc, onClose]);

    if (!mounted || !modalRoot || !isOpen) return null;

    const handleOverlayClick = () => {
        if (!disableOutsideClick) {
            onClose();
        }
    };

    const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
    };

    return createPortal(
        <div
            className={clsx(
                "fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm",
                overlayClassName
            )}
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
        >
            <div
                onClick={handleContentClick}
                className={clsx(
                    // base styles
                    "relative w-full max-w-md rounded-2xl bg-black-800 text-white shadow-2xl",
                    "px-6 py-5",
                    // simple entrance animation
                    "transition-transform transition-opacity duration-150",
                    "opacity-100 scale-100",
                    contentClassName
                )}
            >
                {children}
            </div>
        </div>,
        modalRoot
    );
};

export default Modal;
