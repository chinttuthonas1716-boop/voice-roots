"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Mic, BookOpen, User, MessageSquare, Cpu } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Conversations", href: "/translate", icon: MessageSquare },
    { label: "Transcribe", href: "/upload", icon: Cpu, isCenter: true },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Archive", href: "/archive", icon: BookOpen },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="mobile-nav"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <div key={item.href} className="flex justify-center items-center">
              <Link
                href={item.href}
                className="preserve-fab"
                title="Preserve a Voice"
                aria-label="Preserve a Voice"
              >
                <Icon className="w-6 h-6 stroke-[2.3]" />
              </Link>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="mobile-nav-icon w-5 h-5 stroke-[2]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
