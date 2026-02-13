// src/components/ui/DeleteModal.tsx
import React, { type ReactNode } from "react";
import clsx from "clsx";
import { Button } from "./Button";
import Modal from "./Modal";
import { useApi } from "@/hooks/useApi";

type DeleteModalProps = {
  isOpen: any;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  disableOutsideClick?: boolean;
  isLoading?: boolean,
  className?: string; // extra classes for modal content
  url: string
};

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  title = "Delete item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  disableOutsideClick = false,
  className,
  url
}) => {
  const { isLoading, refetch: callApi,isRefetching } = useApi<{ data: { approvers: any[] } }>({
    url: `/${url}/${isOpen}`,
    auto: false,
    method: "delete",
    transformResponse: (d) => d
  });
  const handleConfirmClick = async () => {
    await callApi();
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // avoid closing by outside click or ESC while loading
      disableOutsideClick={disableOutsideClick || isLoading}
      disableEsc={isLoading}
      ariaLabelledBy="delete-modal-title"
      ariaDescribedBy="delete-modal-description"
      contentClassName={clsx(
        "relative w-full max-w-md px-6 py-5 bg-black-800 rounded-2xl shadow-2xl",
        "animate-in fade-in zoom-in duration-150",
        className
      )}
    >
      {/* Close button (top-right) */}
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className={clsx(
          "absolute right-3 top-3 border opacity-65 rounded-full w-5 h-5 flex items-center justify-center hover:text-gray-200",
          "hover:bg-white/5 transition-colors duration-150",
          isLoading && "cursor-not-allowed opacity-60"
        )}
        aria-label="Close"
      >
        <span aria-hidden="true" className="text-xs">✕</span>
      </button>

      {/* Icon + Title */}
      <div className="flex gap-3 flex-col justify-center items-center">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full text-red-500">
          {/* warning icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.8A1.5 1.5 0 0 0 4.11 19.5h15.78a1.5 1.5 0 0 0 1.29-2.84l-7.4-12.8a1.5 1.5 0 0 0-2.59 0z"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center justify-center">
          <h2
            id="delete-modal-title"
            className="text-base font-semibold text-white"
          >
            {title}
          </h2>

          <div
            id="delete-modal-description"
            className="mt-1 text-sm text-gray-200 text-center"
          >
            {description}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 ">
        <Button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          bgClass="!bg-transparent"
          className="hover:opacity-80 duration-300 !py-2 !text-lg bg-[#0F1627] border border-[#FFFFFF1A]"
        >
          {cancelLabel}
        </Button>

        <Button
          type="button"
          onClick={handleConfirmClick}
          isLoading={isLoading||isRefetching}
          className="!py-2 !text-lg"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
