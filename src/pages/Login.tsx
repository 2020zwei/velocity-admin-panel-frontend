import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/Button";
import Spinner from "@/components/Spinner";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Icon from "@/components/Icon";

const approverSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
            "Password must include an uppercase letter, a lowercase letter, a number and a special character"
        ),
});

type ApproverFormValues = z.infer<typeof approverSchema>;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { data, isLoading, error, refetch: login } = useApi<{ results: any[] }>({
        url: "/admin/signin/",
        method: "post",
        auto: false,
        transformResponse: (d) => d,
    });
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ApproverFormValues>({
        resolver: zodResolver(approverSchema),
        defaultValues: {
            password: "",
            email: "",
        },
    });

    const onSubmit = async (values: ApproverFormValues) => {
        try {
            await login({ body: values });
            navigate('/')
            reset();
        } catch (err) {
            console.error("submit error", err);
        }
    };

    const nonFieldErrors = error?.response?.data?.errors?.non_field_errors;
    const apiErrorMessage =
        error?.response?.data?.message ||
        (Array.isArray(nonFieldErrors) ? nonFieldErrors.join(", ") : nonFieldErrors) ||
        error?.response?.data?.error_message ||
        error?.message;

    return (
        <div className="text-sm text-gray-200 text-center w-full flex justify-center items-center min-h-screen">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 pt-6 max-w-[500px]"
            >
                <div className="text-center ">
                    <img
                        src="/logo.png"
                        alt="Admin panel logo"
                        className="h-12 w-auto mb-16 mx-auto"
                    />
                    <h1 className="text-2xl text-start font-semibold">Welcome to Admin Portal</h1>
                </div>
                <div className="flex flex-col gap-2 w-full text-start mt-5">
                    <label className="font-medium text-base">
                        Email
                        <span className="text-[#EE2B93] ps-1">*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="e.g. alex@salespartner.com"
                        className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full text-start mt-5">
                    <label className="font-medium text-base text-start w-full">
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
                            {showPassword ? <Icon name="offEye" /> : <Icon name="onEye" />}
                        </button>
                    </div>

                    {errors.password && (
                        <p className="text-xs text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button type="submit" disabled={isLoading} className="w-full h-[56px] !text-lg">
                        {isLoading ? <Spinner /> : "Login"}
                    </Button>
                </div>

                <p className="mt-5 text-center text-sm text-gray-300">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="text-[#EE2B93] font-medium hover:opacity-90">
                        Sign up
                    </Link>
                </p>

                {error && apiErrorMessage && (
                    <p className="mt-3 text-sm text-red-400">{String(apiErrorMessage)}</p>
                )}
            </form>
        </div>
    );
};

export default Login;
