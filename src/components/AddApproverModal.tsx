// src/components/ui/AddApproverModal.tsx
import React, { type ReactNode } from "react";
import clsx from "clsx";
import { Button } from "./Button";
import Modal from "./Modal";

type AddApproverModalProps = {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  confirmLoading?: boolean;
  disableOutsideClick?: boolean;
  className?: string;
};

const AddApproverModal: React.FC<AddApproverModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  confirmLoading = false,
  disableOutsideClick = false,
  className,
}) => {
  const handleConfirmClick = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // avoid closing by outside click or ESC while loading
      disableOutsideClick={disableOutsideClick || confirmLoading}
      disableEsc={confirmLoading}
      ariaLabelledBy="delete-modal-title"
      ariaDescribedBy="delete-modal-description"
      contentClassName={clsx(
        "relative w-full max-w-[550px] rounded-2xl bg-black-800 text-white shadow-2xl px-6 py-5 transition-transform transition-opacity duration-150 opacity-100 scale-100 relative w-full max-w-md px-6 py-5 bg-black-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-150",
        className
      )}
    >
      {/* Close button (top-right) */}
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
      <div className="flex gap-3 flex-col justify-center items-center w-full px-2 pb-4">

        <div className="flex flex-col items-center justify-center w-full">
          <h2
            id="delete-modal-title"
            className="text-2xl font-bold text-white mb-3"
          >
            Add Approver
          </h2>
          <div className="text-[#FEFFFFCC]">We just need to know a few things about your Approver.</div>

          <div
            id="delete-modal-description"
            className="mt-1 text-sm text-gray-200 text-center w-full"
          >
            <form action="" className="flex-1 pt-6">

              <div className='flex flex-col gap-2 w-full'>
                <label htmlFor="" className=' font-medium text-base text-start'>
                  Approver Name
                  <span className='text-[#EE2B93] ps-1'>*</span>
                </label>
                <input type="email" placeholder='e.g. alex@salespartner.com' className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]' />
              </div>

              <div className='flex flex-col gap-2 w-full text-start mt-5'>
                <label htmlFor="" className=' font-medium text-base'>
                  Email
                  <span className='text-[#EE2B93] ps-1'>*</span>
                </label>
                <input type="email" placeholder='e.g. alex@salespartner.com' className='bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]' />
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={handleConfirmClick}
                  disabled={confirmLoading}
                  className="w-full min-h-[56px] !text-lg"
                >
                  {confirmLoading ? "Submitting..." : "Save Details"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddApproverModal;
