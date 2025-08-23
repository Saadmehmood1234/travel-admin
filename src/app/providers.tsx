"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(168,85,247,0.9))", // from-primary-400 to-secondary-400
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "1rem",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            padding: "12px 16px",
            fontWeight: 500,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#38bdf8", // primary-300
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background:
                "linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))", // red gradient
              border: "1px solid rgba(255, 255, 255, 0.2)",
            },
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
          loading: {
            duration: Infinity,
            iconTheme: { primary: "#facc15", secondary: "#fff" }, // yellow
          },
        }}
      />
    </SessionProvider>
  );
}
