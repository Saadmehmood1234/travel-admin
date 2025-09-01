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
  TicketPercent,
  Plane,
  Star, 
} from "lucide-react";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";
import { FaBlog } from "react-icons/fa";

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
    { label: "Contact", icon: MessageSquare, href: "/contact" },
    { label: "Offer", icon: TicketPercent, href: "/offer" },
    { label: "Flight Booking", icon: Plane, href: "/flight-booking" },
    { label: "Payments", icon: CreditCard, href: "/payments" },
    { label: "Testimonials", icon: Star, href: "/testimonials" }, 
    { label: "Blogs", icon: FaBlog, href: "/blogs" }, 
  ];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card shadow-md text-card-foreground border border-border"
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
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-sidebar border-r border-sidebar-border flex flex-col
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
        <div className="p-4 font-bold text-lg border-b border-sidebar-border text-sidebar-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-sidebar-primary" />
          <span>Admin Panel</span>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1 p-3">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sidebar-foreground 
                         hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="h-4 w-4 group-hover:scale-110 transition-transform text-muted-foreground group-hover:text-sidebar-primary" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-4">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary/10 flex items-center justify-center border border-sidebar-primary/20">
              <User className="h-5 w-5 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {session.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user?.email || "admin@example.com"}
              </p>
            </div>
          </div>
          <div className="px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}