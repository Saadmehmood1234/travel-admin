"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/actions/reset.action";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      setError("Invalid reset token");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("token", token);

      const response = await resetPassword(formData);
      if (!response.success)
        throw new Error(response.error || "Something went wrong");

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex w-full justify-center items-center py-8 pb-24 bg-white min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-400 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-gray-300 to-gray-200 rounded-full blur-3xl opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full flex-col items-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div className="bg-white backdrop-blur-md border border-gray-300 rounded-3xl p-8 max-w-md w-full shadow-xl relative overflow-hidden">

          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-400 rounded-full blur-3xl opacity-20" />

          <div className="flex flex-col items-center gap-4 relative">
            <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
              Reset Password
            </h2>
            <p className="text-lg text-gray-600 text-center">
              {success
                ? "Password updated successfully!"
                : "Enter your new password"}
            </p>

            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="text-gray-700 w-14 h-14 mx-auto" />
                <p className="text-gray-600">
                  Your password has been reset successfully.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/auth/signin">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl shadow-md transition-all">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4"
              >
                <Input
                  label="New Password"
                  type="password"
                  icon={<Lock className="h-5 w-5 text-gray-600" />}
                  {...register("password")}
                  error={
                    errors.password ? { message: errors.password.message } : undefined
                  }
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={<Lock className="h-5 w-5 text-gray-600" />}
                  {...register("confirmPassword")}
                  error={
                    errors.confirmPassword
                      ? { message: errors.confirmPassword.message }
                      : undefined
                  }
                  placeholder="••••••••"
                />
                {error && (
                  <p className="text-gray-800 text-sm text-center font-medium">{error}</p>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl shadow-md transition-all"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </motion.div>
              </form>
            )}

            {!success && (
              <p className="text-gray-600 text-center text-sm">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-gray-900 hover:text-gray-700 transition-colors font-medium underline"
                >
                  Sign In
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}