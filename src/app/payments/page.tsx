"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

const Payments = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  if (!session) {
    router.push("/auth/signin");
    return;
  }
  return <div>Payments</div>;
};

export default Payments;
