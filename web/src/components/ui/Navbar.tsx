"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Mic, Languages, HardDrive, User, LogOut } from "lucide-react";
import { getCurrentUser, logoutUser, type UserProfile } from "@/lib/auth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/record", label: "Record", icon: Mic },
    { href: "/translate", label: "Translate", icon: Languages },
    { href: "/dashboard", label: "My recordings", icon: HardDrive },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#080A12]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-[#F8FAFC] hover:opacity-90 transition">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-lg shadow-sm">
            🌱
          </span>
          <span className="font-bold text-lg tracking-tight text-white">Voice Roots</span>
        </Link>

        {/* Desktop Nav: Max 4 items */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#F59E0B]" : "text-[#94A3B8]"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile / Auth Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-sm font-medium text-[#94A3B8]">
                {user.name.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-[#F8FAFC] hover:bg-white/10 transition"
              >
                <LogOut className="h-4 w-4 text-[#94A3B8]" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-[#F8FAFC] hover:bg-white/10 transition"
            >
              <User className="h-4 w-4 text-[#F59E0B]" />
              <span>Log in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
