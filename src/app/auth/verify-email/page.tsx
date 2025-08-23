"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Plane, CheckCircle2, AlertTriangle } from "lucide-react";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setMessage("No verification token found.");
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post("/api/auth/verify-email", { token });
        setMessage("Your email has been verified! Redirecting to sign in...");
        setStatus("success");
        setTimeout(() => router.push("/auth/signin"), 3000);
      } catch {
        setMessage(
          "Invalid or expired token. Please request a new verification email."
        );
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <section className="flex justify-center items-center min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      
      {/* Floating plane icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-10 left-10 opacity-20"
      >
        <Plane size={48} className="text-gray-800" />
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white backdrop-blur-lg border border-gray-300 rounded-3xl p-8 shadow-xl w-full max-w-md relative z-10"
      >
        <div className="text-center space-y-6">
          {status === "success" && (
            <CheckCircle2 className="text-gray-700 w-14 h-14 mx-auto" />
          )}
          {status === "error" && (
            <AlertTriangle className="text-gray-700 w-14 h-14 mx-auto" />
          )}
          {status === "loading" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-16 h-16 border-t-4 border-gray-400 rounded-full mx-auto"
            />
          )}

          <h1 className="text-2xl font-bold text-gray-900">
            {message}
          </h1>
          {status === "success" && (
            <p className="text-sm text-gray-600">
              ✈️ Welcome aboard! Preparing your journey...
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-gray-600">
              Please try again or contact support for help.
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-white">
          <div className="text-gray-900">Loading verification...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
} 