"use client"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react'

const Setting = () => {
        const router = useRouter();
      const { data: session, status } = useSession();
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  return (
    <div>Setting</div>
  )
}

export default Setting