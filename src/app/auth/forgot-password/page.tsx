"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "@/actions/reset.action";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      console.log("values", values);
      formData.append("email", values.email);
      const response = await sendPasswordResetEmail(formData);
      if (!response.success) {
        throw new Error(response.error || "Something went wrong");
      }
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
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      
      {/* Decorative elements */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-400 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-gray-300 to-gray-200 rounded-full blur-3xl opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex w-full flex-col items-center px-4 sm:px-6 lg:px-8"
      >
        <motion.div className="bg-white backdrop-blur-md border border-gray-300 rounded-3xl p-8 max-w-md w-full shadow-xl relative overflow-hidden">
          {/* Inner subtle effect */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-400 rounded-full blur-3xl opacity-20" />

          <div className="flex flex-col items-center gap-4 relative">
            <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
              Forgot Password
            </h2>
            <p className="text-lg text-gray-600 text-center">
              {success
                ? "Check your email inbox for a reset link"
                : "Enter your email to reset your password"}
            </p>

            {success ? (
              <div className="w-full text-center">
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to your email. If you don't
                  see it, check your spam folder.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl shadow-md transition-all"
                  >
                    Back to Sign In
                  </Button>
                </motion.div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  icon={<Mail className="h-5 w-5 text-gray-600" />}
                  {...register("email")}
                  error={
                    errors.email ? { message: errors.email.message } : undefined
                  }
                  placeholder="Enter your email"
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
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </motion.div>
              </form>
            )}

            <p className="text-gray-600 text-center">
              Remember your password?{" "}
              <Link
                href="/auth/signin"
                className="text-gray-900 hover:text-gray-700 transition-colors font-medium underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}