"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, Languages, HardDrive, User } from "lucide-react";
import { getCurrentUser, type UserProfile } from "@/lib/auth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Record", href: "/record", icon: Mic },
    { label: "Translate", href: "/translate", icon: Languages },
    { label: "My recordings", href: "/dashboard", icon: HardDrive },
    { label: user ? "Profile" : "Log in", href: "/login", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080A12]/90 backdrop-blur-xl border-t border-white/10 px-2 pt-2"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[60px] py-1 rounded-xl transition ${
                isActive
                  ? "text-[#F59E0B]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
