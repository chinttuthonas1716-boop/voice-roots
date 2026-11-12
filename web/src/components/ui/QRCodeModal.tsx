"use client";

import React, { useState } from "react";
import {
  X,
  QrCode,
  Smartphone,
  Globe,
  FileCheck,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Radio,
} from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "website" | "app" | "passport";
}

export function QRCodeModal({
  isOpen,
  onClose,
  defaultTab = "app",
}: QRCodeModalProps) {
  const [activeTab, setActiveTab] = useState<"website" | "app" | "passport">(defaultTab);
  const [networkMode, setNetworkMode] = useState<"public" | "wifi">("public");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicBase = "https://farming-proposition-love-showcase.trycloudflare.com";
  const localBase = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const currentBase = networkMode === "public" ? publicBase : localBase;

  const getUrl = () => {
    switch (activeTab) {
      case "website":
        return currentBase;
      case "app":
        return `${currentBase}/app`;
      case "passport":
        return `${currentBase}/passport/vr-106`;
    }
  };

  const getQrImage = () => {
    const url = getUrl();
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(url)}&margin=12`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#0e121a] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-root-green/15 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-root-green/10 text-leaf-green border border-root-green/30">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Scan with Phone</h2>
              <p className="text-xs text-secondary-text">Camera-scannable QR code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-secondary-text hover:bg-white/10 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab selection: Website vs Mobile App vs Passport */}
        <div className="mt-4 flex rounded-2xl bg-white/5 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("app")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition ${
              activeTab === "app"
                ? "bg-root-green text-obsidian shadow-glow font-bold"
                : "text-secondary-text hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("website")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition ${
              activeTab === "website"
                ? "bg-root-green text-obsidian shadow-glow font-bold"
                : "text-secondary-text hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> Website
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("passport")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition ${
              activeTab === "passport"
                ? "bg-root-green text-obsidian shadow-glow font-bold"
                : "text-secondary-text hover:text-white"
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" /> Passport
          </button>
        </div>

        {/* Network Mode Switcher */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
          <span className="text-secondary-text flex items-center gap-1.5 text-[11px]">
            {networkMode === "public" ? (
              <Radio className="h-3 w-3 text-leaf-green" />
            ) : (
              <Wifi className="h-3 w-3 text-amber-400" />
            )}
            Target Network:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setNetworkMode("public")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                networkMode === "public"
                  ? "bg-leaf-green/20 text-leaf-green border border-leaf-green/40"
                  : "text-secondary-text hover:text-white"
              }`}
            >
              Public HTTPS
            </button>
            <button
              onClick={() => setNetworkMode("wifi")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                networkMode === "wifi"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                  : "text-secondary-text hover:text-white"
              }`}
            >
              Local Wi-Fi
            </button>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="mt-5 flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-2xl bg-white shadow-xl border-4 border-root-green/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getQrImage()}
              alt="Voice Roots QR Code"
              width={220}
              height={220}
              className="rounded-lg object-contain"
            />
          </div>
          <p className="text-center text-xs text-secondary-text max-w-xs">
            Open your smartphone camera and point it at this QR code to launch instantly.
          </p>
        </div>

        {/* URL Pill & Copy Actions */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono">
          <span className="flex-1 truncate text-secondary-text pl-2">{getUrl()}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-leaf-green" />
                <span className="text-[11px] font-sans text-leaf-green">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[11px] font-sans">Copy</span>
              </>
            )}
          </button>
          <a
            href={getUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-white hover:bg-white/20 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="text-[11px] font-sans">Open</span>
          </a>
        </div>
      </div>
    </div>
  );
}

