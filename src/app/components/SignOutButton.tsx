"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <motion.button
      onClick={handleSignOut}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-2 py-2 rounded-xl font-semibold text-black cursor-pointer shadow-lg
                  border border-gray-600 
                 hover:opacity-90 transition-all
                 backdrop-blur-md "
    >
      <LogOut size={20} className="text-black text-sm" />
      Sign Out
    </motion.button>
  );
}
