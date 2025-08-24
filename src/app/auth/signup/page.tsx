"use client";

import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { User, Mail, Lock, Phone } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { signup } from "@/actions/signup.actions";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone must be a valid 10-digit number"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignUpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    const res = await signup(values);

    if (!res.success) {
      toast.error(res.message || "Error in SignUp");
      setLoading(false);
      return;
    }
    toast.success(res.message || "SignUp Successfully");
    reset();
    setLoading(false);
    router.push("/verifyemail");
  };

  return (
    <section className="flex w-full justify-center items-center py-8 pb-24 bg-white flex-1 h-full relative overflow-hidden pt-[60px]">
      <div className="flex flex-col items-center gap-4 relative bg-white border border-gray-300 px-9 py-10 rounded-xl shadow-md">
        <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
          Create Account
        </h2>
        <p className="text-gray-600 text-center">
          Join us and start your journey!
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <Input
            label="Full Name"
            icon={<User className="h-5 w-5 text-gray-600" />}
            {...register("name")}
            error={errors.name && { message: errors.name.message }}
            placeholder="John Doe"
            className="pl-10 w-[400px] h-[40px] rounded border-gray-300 border-2"
          />

          <Input
            label="Email"
            icon={<Mail className="h-5 w-5 text-gray-600" />}
            {...register("email")}
            error={errors.email && { message: errors.email.message }}
            placeholder="example@gmail.com"
            className="pl-10 w-[400px] h-[40px] rounded border-gray-300 border-2"
          />

          <Input
            label="Phone Number"
            icon={<Phone className="h-5 w-5 text-gray-600" />}
            {...register("phone")}
            error={errors.phone && { message: errors.phone.message }}
            placeholder="9876543210"
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

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded shadow-md transition-all"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </motion.div>
        </form>

        {/* Divider */}
        {/* <div className="w-full flex items-center space-x-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-600 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div> */}

        {/* Google sign-up */}
        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-900 py-4 rounded shadow-sm transition-all hover:bg-gray-50"
        >
          <FaGoogle className="text-xl" />
          <span>Sign up with Google</span>
        </motion.button> */}

        {/* Redirect to Sign In */}
        <p className="text-gray-600 text-center">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/signin")}
            className="text-gray-900 hover:text-gray-700 transition-colors font-medium underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </section>
  );
}