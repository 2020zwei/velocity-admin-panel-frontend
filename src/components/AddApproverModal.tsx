import React, { useEffect } from "react";
import clsx from "clsx";
import { Button } from "./Button";
import Modal from "./Modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/hooks/useApi";

interface AddApproverModalProps {
  isOpen: unknown;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  confirmLoading?: boolean;
  disableOutsideClick?: boolean;
  className?: string;
};

const approverSchema = z.object({
  name: z.string().min(1, "Approver name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ApproverFormValues = z.infer<typeof approverSchema>;

const AddApproverModal: React.FC<AddApproverModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  confirmLoading = false,
  disableOutsideClick = false,
  className,
}) => {

  const { isLoading, refetch: update } = useApi<{ results: unknown[] }>({
    url: `/approvers/${isOpen?.id ?? ''}`,
    method: isOpen?.id ? "patch" : "post",
    auto: false,
    transformResponse: (d) => d,
  });


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ApproverFormValues>({
    resolver: zodResolver(approverSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: ApproverFormValues) => {
    await update({ body: values });
    onConfirm()
    reset();
  };



  const resetAll = () => {
    setValue("email", '')
    setValue("name", '')
    onClose()
  }

  useEffect(() => {
    const data = isOpen
    if (data?.email) {
      reset(data)
    }
  }, [isOpen, reset])


  return (
    <Modal
      isOpen={Boolean(isOpen)}
      onClose={resetAll}
      disableOutsideClick={disableOutsideClick || confirmLoading}
      disableEsc={confirmLoading}
      ariaLabelledBy="delete-modal-title"
      ariaDescribedBy="delete-modal-description"
      contentClassName={clsx(
        "relative w-full max-w-[550px] rounded-2xl bg-black-800 text-white shadow-2xl sm:!px-6 !px-1 py-5 transition-transform transition-opacity duration-150 opacity-100 scale-100 relative w-full max-w-md px-6 py-5 bg-black-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-150",
        className
      )}
    >
      <button
        type="button"
        onClick={resetAll}
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
            {isOpen?.email ? 'Edit Approver' : 'Add Approver'}
          </h2>
          <div className="text-[#FEFFFFCC]">
            We just need to know a few things about your Approver.
          </div>

          <div
            id="delete-modal-description"
            className="mt-1 text-sm text-gray-200 text-center w-full"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 pt-6">
              <div className="flex flex-col gap-2 w-full">
                <label htmlFor="" className=" font-medium text-base text-start">
                  Approver Name
                  <span className="text-[#EE2B93] ps-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex@salespartner.com"
                  className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 text-start">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full text-start mt-5">
                <label htmlFor="" className=" font-medium text-base">
                  Email
                  <span className="text-[#EE2B93] ps-1">*</span>
                </label>
                {isOpen ? <div  className="bg-[#09090E] flex items-center opacity-70 cursor-not-allowed h-14 rounded-xl px-3 border border-[#FFFFFF1A]">{isOpen?.email}</div> :
                  <>
                    <input
                      type="email"
                      placeholder="e.g. alex@salespartner.com"
                      className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </>}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  className="w-full h-[56px] !text-lg"
                  isLoading={isLoading}
                >
                  {isOpen?.email ? "Update Details" : "Save Details"}
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
