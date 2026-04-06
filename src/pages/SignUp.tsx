import { Button } from "@/components/Button";
import Icon from "@/components/Icon";
import ImageUpload from "@/components/ImageUpload";
import Spinner from "@/components/Spinner";
import axiosInstance from "@/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const signUpSchema = z
  .object({
    organization_name: z.string().min(1, "Organization name is required"),
    name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    profile_picture: z
      .instanceof(File, { message: "Profile picture is required" })
      .refine((file) => file.size <= 5 * 1024 * 1024, "Image must be 5MB or less"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
        "Password must include uppercase, lowercase, number and special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      organization_name: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } as any,
  });

  const selectedFile = watch("profile_picture");

  const onSubmit = async (values: SignUpFormValues) => {
    setServerError("");
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("organization_name", values.organization_name);
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("profile_picture", values.profile_picture);
      formData.append("max_sales_rep", "1");
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      await axiosInstance.post("signup/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/login");
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full">
        <img src="/logo.png" alt="Velocity IQ logo" className="h-8 w-auto" />
      </div>

      <div className="max-w-[500px] mx-auto mt-10 pb-10">
        <h1 className="text-2xl leading-tight font-semibold mb-8">Create Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium text-base">
              Organization Name <span className="text-[#EE2B93]">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter organization name"
              className="bg-[#12171F] h-14 rounded-xl px-4 border border-[#2A3443] w-full text-white placeholder:text-[#6D7685]"
              {...register("organization_name")}
            />
            {errors.organization_name && (
              <p className="text-xs text-red-500">{errors.organization_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-base">
              Administrator Name <span className="text-[#EE2B93]">*</span>
            </label>
            <input
              type="text"
              placeholder="Please enter your name"
              className="bg-[#12171F] h-14 rounded-xl px-4 border border-[#2A3443] w-full text-white placeholder:text-[#6D7685]"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-base">
              Work Email <span className="text-[#EE2B93]">*</span>
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              className="bg-[#D5DEEE] h-14 rounded-xl px-4 border border-[#D5DEEE] w-full text-[#222A35] placeholder:text-[#4F5A69]"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <ImageUpload
            label="Profile Picture"
            value={selectedFile}
            required
            onChange={(file) => setValue("profile_picture", file as any, { shouldValidate: true })}
            error={errors.profile_picture?.message as string | undefined}
          />

          <div className="space-y-2">
            <label className="font-medium text-base">
              Password <span className="text-[#EE2B93]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="bg-[#D5DEEE] h-14 rounded-xl px-4 border border-[#D5DEEE] w-full text-[#222A35] placeholder:text-[#4F5A69] pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892A3]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Icon name="offEye" /> : <Icon name="onEye" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-base">
              Confirm Password <span className="text-[#EE2B93]">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter password again"
                className="bg-[#12171F] h-14 rounded-xl px-4 border border-[#2A3443] w-full text-white placeholder:text-[#6D7685] pr-12"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8892A3]"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <Icon name="offEye" /> : <Icon name="onEye" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-1">
            <Button type="submit" disabled={isLoading} className="w-full h-[56px] !text-lg">
              {isLoading ? <Spinner /> : "Sign Up"}
            </Button>
          </div>

          <p className="text-center text-white text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#EE2B93] hover:opacity-90">
              Sign in here
            </Link>
          </p>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
