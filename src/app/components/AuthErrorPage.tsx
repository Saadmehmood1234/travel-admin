"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "./Button";
import { useState, Suspense } from "react";
import { resendVerificationEmail } from "@/actions/sendMail.actions";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const email = searchParams.get("email");
      if (!email) throw new Error("Email not found");

      const result = await resendVerificationEmail(email);
      setResendStatus(result);
    } catch (error) {
      setResendStatus({
        success: false,
        message: "Failed to resend verification email",
      });
    } finally {
      setIsResending(false);
    }
  };

  const errorMessages: Record<string, { title: string; description: string }> =
    {
      "email-not-verified": {
        title: "Email Not Verified",
        description: "Please verify your email address to continue",
      },
      "invalid-credentials": {
        title: "Invalid Credentials",
        description: "The email or password you entered is incorrect",
      },
      "user-not-found": {
        title: "Account Not Found",
        description: "No account exists with this email address",
      },
      "duplicate-phone": {
        title: "Phone Number Already Used",
        description:
          "An account with this phone number already exists. Please use a different phone number or sign in.",
      },
      "oauth-account-not-linked": {
        title: "Account Not Linked",
        description:
          "Please sign in with the original method you used to register",
      },
      default: {
        title: "Authentication Error",
        description: "Something went wrong during authentication",
      },
    };

  const currentError =
    errorMessages[error || "default"] || errorMessages.default;
  const email = searchParams.get("email");

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-140px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-gray-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-gray-800"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{currentError.title}</h1>
          <p className="text-gray-600">{currentError.description}</p>

          {error === "email-not-verified" && email && (
            <div className="w-full space-y-4 pt-4">
              <button
                onClick={handleResend}
                disabled={isResending}
                className={`w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 ${isResending ? 'cursor-not-allowed' : ''}`}
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Resend Verification Email"
                )}
              </button>
              {resendStatus && (
                <p
                  className={`text-sm ${
                    resendStatus.success ? "text-gray-700" : "text-gray-800"
                  }`}
                >
                  {resendStatus.message}
                </p>
              )}
            </div>
          )}

          <Link
            href="/auth/signin"
            className="text-sm font-medium text-gray-900 hover:text-gray-700 underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-900">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}