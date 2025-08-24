"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { Mail, Lock } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error || "Invalid email or password");
      } else {
        toast.success("Signed in successfully");
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex w-full justify-center items-center py-8 pb-24 bg-white flex-1 h-full relative overflow-hidden pt-[60px]">
      <div className="flex flex-col items-center gap-4 relative bg-white border border-gray-300 px-9 py-10 rounded-xl shadow-md">
        <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
          Sign In
        </h2>
        <p className="text-gray-600 text-center">Welcome back, traveler!</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <Input
            label="Email"
            icon={<Mail className="h-5 w-5 text-gray-600" />}
            {...register("email")}
            error={errors.email && { message: errors.email.message }}
            placeholder="example@gmail.com"
            className="pl-10 w-[400px] h-[40px] rounded border-gray-300 border-2"
          />

          <Input
            label="Password"
            type="password"
            icon={<Lock className="h-5 w-5 text-gray-600" />}
            {...register("password")}
            error={errors.password && { message: errors.password.message }}
            placeholder="••••••••"
            className="pl-10 w-[400px] h-[40px] rounded border-gray-300 border-2"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors underline"
            >
              Forgot password?
            </button>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded shadow-md transition-all"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </motion.div>
        </form>

        {/* Divider */}
        {/* <div className="w-full flex items-center space-x-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-600 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div> */}

        {/* Google sign-in */}
        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => signIn("google", { callbackUrl: "/" })}  
          className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-900 py-4 rounded shadow-sm transition-all hover:bg-gray-50"
        >
          <FaGoogle className="text-xl" />
          <span>Sign in with Google</span>
        </motion.button> */}

        {/* Redirect to Sign Up */}
        <p className="text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-gray-900 hover:text-gray-700 transition-colors font-medium underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </section>
  );
}