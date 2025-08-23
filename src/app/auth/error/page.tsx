"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
const ErrorContent = dynamic(() => import("@/app/components/AuthErrorPage"));

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
