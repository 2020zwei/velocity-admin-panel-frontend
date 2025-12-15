import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/Button";
import Spinner from "@/components/Spinner";
import { useNavigate } from "react-router-dom";

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
    const { data, isLoading, error, refetch: login } = useApi<{ results: any[] }>({
        url: "/signin/",
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

    return (
        <div className="text-sm text-gray-200 text-center w-full flex justify-center items-center min-h-screen">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 pt-6 max-w-[500px]"
            >
                <div>
                    <h1 className="text-2xl text-start font-semibold">Welcome to admin panel</h1>
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
                    <label className="font-medium text-base">
                        Password
                        <span className="text-[#EE2B93] ps-1">*</span>
                    </label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="bg-[#09090E] h-14 rounded-xl px-3 border border-[#FFFFFF1A]"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button type="submit" disabled={isLoading} className="w-full h-[56px] !text-lg">
                        {isLoading ? <Spinner /> : "Login"}
                    </Button>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-red-400">Server error: {String(error?.message ?? error)}</p>
                )}
            </form>
        </div>
    );
};

export default Login;
