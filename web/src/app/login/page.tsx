"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import {
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  type UserProfile,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = loginWithGoogle();
      setCurrentUser(user);
      setMessage("Signed in with Google.");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setError("Unable to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const user = loginUser(email.trim(), password);
      setCurrentUser(user);
      setMessage(`Welcome back, ${user.name}!`);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setError("Unable to sign in. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    setIsLoading(true);
    setError(null);
    try {
      const guest = loginAsGuest();
      setCurrentUser(guest);
      setMessage("Browsing as guest.");
      setTimeout(() => router.push("/"), 800);
    } catch {
      setError("Unable to start guest session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setMessage("Signed out successfully.");
  };

  return (
    <div className="min-h-screen pb-20 pt-20">
      <Navbar />

      <main className="mx-auto max-w-md px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-2xl shadow-sm mb-2">
            🌱
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">Voice Roots</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Preserve and listen to community voices.</p>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* One Glass Card */}
        <div className="glass-card p-6 sm:p-8">
          {currentUser ? (
            /* Logged In View */
            <div className="space-y-5 text-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#94A3B8]">Signed in as</p>
                <h2 className="text-xl font-bold text-[#F8FAFC] mt-1">{currentUser.name}</h2>
                <p className="text-sm text-[#94A3B8]">{currentUser.email}</p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="btn-primary w-full"
                >
                  Go to My recordings
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-glass w-full"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            /* 3 Options: Google, Email/Password, Guest */
            <div className="space-y-5">
              {/* Option 1: Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="btn-glass w-full justify-center"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.6-5.2 3.6-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.26C.46 8.2.01 10.04.01 12s.45 3.8 1.25 5.4l4.06-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.2 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.6l4.06 3.13c.94-2.83 3.58-4.96 6.68-4.96z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#0B0F19] px-3 text-xs uppercase tracking-wider text-[#94A3B8]">
                  or
                </span>
              </div>

              {/* Option 2: Email and Password */}
              <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#F8FAFC] mb-1">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-[#F8FAFC] mb-1">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? "Signing in..." : "Sign in with Email"}
                </button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#0B0F19] px-3 text-xs uppercase tracking-wider text-[#94A3B8]">
                  or
                </span>
              </div>

              {/* Option 3: Continue as guest */}
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={isLoading}
                className="btn-glass w-full justify-center"
              >
                Continue as guest
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
