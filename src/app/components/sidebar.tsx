"use client";

import Link from "next/link";
import { Home, Users, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import dynamicModelTypeGenerator from "@/lib/dynamic-model-type-generator";

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Users", icon: Users, href: "/users" },
    { label: "Product", icon: Users, href: "/product" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700 border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r flex flex-col
          fixed md:sticky top-0 left-0 h-screen z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64
        `}
      >
        <div className="p-4 font-bold text-lg border-b text-black">Admin Panel</div>
        
        {/* Make the nav scrollable if content overflows */}
        <nav className="flex-1 overflow-y-auto space-y-1 p-2">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}