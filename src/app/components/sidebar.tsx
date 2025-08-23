// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  Users,
  Settings,
  Menu,
  X,
  Package,
  ShoppingCart,
  BarChart3,
  CreditCard,
  Image,
  Images,
  SubscriptIcon,
  MessageSquare,
  Mail,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";

export function Sidebar() {
  const { data: session, status } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!session) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/" },
    { label: "Users", icon: Users, href: "/users" },
    { label: "Products", icon: Package, href: "/products" },
    { label: "Orders", icon: ShoppingCart, href: "/orders" },
    { label: "Images", icon: Images, href: "/images" },
    { label: "Subscribers", icon: Mail, href: "/subscriber" },
    { label: "Payments", icon: CreditCard, href: "/payments" },
    { label: "Contact Forms", icon: MessageSquare, href: "/contact" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-700 border border-gray-200"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
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
          bg-white border-r border-gray-200 flex flex-col
          fixed md:sticky top-0 left-0 h-screen z-40
          transition-transform duration-300 ease-in-out
          ${
            isMobileOpen
              ? "translate-x-0 shadow-xl"
              : "-translate-x-full md:translate-x-0"
          }
          w-64
        `}
      >
        {/* Header */}
        <div className="p-4 font-bold text-lg border-b border-gray-200 text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span>Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 p-3">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 
                         hover:bg-blue-50 hover:text-blue-700 transition-colors group"
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="h-4 w-4 group-hover:scale-110 transition-transform text-gray-500 group-hover:text-blue-600" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User profile section at the bottom */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user?.email || "admin@example.com"}
              </p>
            </div>
          </div>

          {/* Sign out button - now properly aligned */}
          <div className="px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}