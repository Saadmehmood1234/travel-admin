"use client";

import Link from "next/link";
import { Home, Users, Settings } from "lucide-react";
import dynamicModelTypeGenerator from "@/lib/dynamic-model-type-generator";
export function Sidebar() {
  const navItems = [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Users", icon: Users, href: "/users" },
     { label: "Product", icon: Users, href: "/product" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];
console.log(dynamicModelTypeGenerator({
  title: 'String',
  location: 'String',
  price: 'Number',
  originalPrice: 'Number',
  rating: 'Number',
  category: 'String',
  imgUrl: 'String',
  description: 'String',
  reviews: 'Number-false',
  discount: {
    token: 'String-false',
    amount: 'Number-false'
  }
} ),"type")
  return (
    <aside className="md:flex md:flex-col md:w-64 md:border-r md:bg-white h-screen fixed left-0 top-0">
      <div className="p-4 font-bold text-lg border-b text-black">Admin Panel</div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
