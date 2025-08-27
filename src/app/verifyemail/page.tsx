"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../components/Button";
import { Mail } from "lucide-react";

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resendVerificationEmail = async () => {
    setIsResending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setMessage("Verification email resent! Check your Gmail inbox.");
      } else {
        const err = await response.json();
        setError(err.error || "Failed to resend verification email");
      }
    } catch {
      setError("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

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
            <Mail className="h-12 w-12 text-gray-800" />
            <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
              Verify Your Email
            </h2>

            <p className="text-gray-600 text-center">
              We've sent a verification link to your email address. Please check
              your Gmail inbox and click the link to complete your registration.
            </p>

            {message && (
              <p className="text-green-600 text-center font-medium">{message}</p>
            )}
            {error && (
              <p className="text-red-600 text-center font-medium">{error}</p>
            )}

            <motion.div
              className="w-full flex flex-col gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={resendVerificationEmail}
                disabled={isResending}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl shadow-md transition-all"
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>

              <Button
                onClick={() => signIn()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-4 rounded-xl transition-all border border-gray-300"
              >
                Already Verified? Sign In
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}