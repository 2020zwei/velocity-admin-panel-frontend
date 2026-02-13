import React from "react";
import clsx from "clsx";
import Modal from "./Modal";
import CompetirorForm, { type FormValues } from "./CompetirorForm";

interface AddApproverModalProps {
  isOpen: unknown;
  onConfirm: (data:FormValues) => void | Promise<void>;
  onClose?: () => void;
  confirmLoading?: boolean;
  disableOutsideClick?: boolean;
  className?: string;
};

const EditCompititorModal: React.FC<AddApproverModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  confirmLoading = false,
  disableOutsideClick = false,
  className,
}) => {
  return (
    <Modal
      isOpen={Boolean(isOpen)}
      onClose={onClose!}
      disableOutsideClick={disableOutsideClick || confirmLoading}
      disableEsc={confirmLoading}
      ariaLabelledBy="delete-modal-title"
      ariaDescribedBy="delete-modal-description"
      contentClassName={clsx(
        "relative w-full max-w-[520px] rounded-2xl bg-black-800 text-white shadow-2xl sm:!px-6 !px-1 py-5 transition-transform transition-opacity duration-150 opacity-100 scale-100 relative w-full max-w-md px-6 py-5 bg-black-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-150",
        className
      )}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={confirmLoading}
        className={clsx(
          "absolute right-3 top-3 border opacity-65 rounded-full w-5 h-5 flex items-center justify-center hover:text-gray-200",
          "hover:bg-white/5 transition-colors duration-150",
          confirmLoading && "cursor-not-allowed opacity-60"
        )}
        aria-label="Close"
      >
        <span aria-hidden="true">✕</span>
      </button>

      {/* Icon + Title */}
      <CompetirorForm
        obSubmit={onConfirm}
        isPending={confirmLoading}
        defaultData={isOpen}
      />
    </Modal>
  );
};

export default EditCompititorModal;
