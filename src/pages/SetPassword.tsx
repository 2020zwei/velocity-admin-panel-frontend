import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/Button";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/Icon";

/* ===================== SCHEMA ===================== */

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirm_password: z
            .string()
            .min(1, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });

type PasswordFormValues = z.infer<typeof passwordSchema>;

/* ===================== PAGE ===================== */

const SetPassword: React.FC = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { isLoading, refetch: update } = useApi({
        url: "/admin/sales-reps/set-password/",
        method: "post",
        auto: false,
        transformResponse: (d) => d,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            confirm_password: "",
        },
    });

    const onSubmit = async (values: PasswordFormValues) => {
        const uid = "OA";
        const token = "d0p53s-f438d081a325a044494d62a53ec39e8a";

        try {
            await update({
                body: {
                    password: values.password,
                    confirm_password: values.confirm_password,
                    token,
                    uid,
                },
            });
            navigate("/login");
            reset();
        } catch (err) { }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="min-h-screen flex items-center justify-center bg-black-900 px-4">
            <div className="w-full max-w-md bg-black-800 rounded-2xl shadow-2xl px-6 py-8">
                <h1 className="text-2xl font-bold text-center mb-2">
                    Set Your Password
                </h1>
                <p className="text-sm text-gray-300 text-center mb-6">
                    Please enter and confirm your new password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-base text-start">
                            Password <span className="text-[#EE2B93]">*</span>
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                className="bg-[#09090E] h-14 w-full rounded-xl px-3 pr-12 border border-[#FFFFFF1A]"
                                {...register("password")}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <Icon name="offEye"/> : <Icon name="onEye"/>}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-xs text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-base text-start">
                            Confirm Password <span className="text-[#EE2B93]">*</span>
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm password"
                                className="bg-[#09090E] h-14 w-full rounded-xl px-3 pr-12 border border-[#FFFFFF1A]"
                                {...register("confirm_password")}
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirm((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                aria-label={
                                    showConfirm ? "Hide confirm password" : "Show confirm password"
                                }
                            >
                                {showConfirm ? <Icon name="offEye"/> : <Icon name="onEye"/>}
                            </button>
                        </div>

                        {errors.confirm_password && (
                            <p className="text-xs text-red-500">
                                {errors.confirm_password.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-[56px] !text-lg"
                        isLoading={isLoading}
                    >
                        Save Password
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;
