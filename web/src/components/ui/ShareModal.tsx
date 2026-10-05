"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Share2, MessageCircle, Send, QrCode, Globe, Smartphone, Sparkles, ExternalLink } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  url?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title = "Voice Roots — Rooting Oral Languages in Digital Text with AI",
  description = "Preserving endangered spoken languages, tribal dialects, and elder memory into structured digital text with AI and audio preservation.",
  url,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"links" | "qr">("links");
  const [shareUrl, setShareUrl] = useState("http://localhost:3000");
  const [lanUrl, setLanUrl] = useState("http://192.168.1.3:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = url || window.location.href;
      setShareUrl(currentUrl);
      if (window.location.hostname !== "localhost") {
        setLanUrl(currentUrl);
      }
    }
  }, [url]);

  if (!isOpen) return null;

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User dismissed or share failed
      }
    } else {
      handleCopy(shareUrl);
    }
  };

  const shareText = encodeURIComponent(`${title}\n\n${description}\n\nExplore the platform: `);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}${encodeURIComponent(shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  // Quick SVG QR Code visual representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    lanUrl || shareUrl
  )}&bgcolor=14-14-14&color=255-255-255&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl ios27-glass p-6 sm:p-7 relative border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular ambient red glow behind header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-netflix-red/20 blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-netflix-red flex items-center justify-center shadow-netflix-glow">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Share Voice Roots
              </h3>
              <p className="text-xs text-netflix-gray">
                Invite friends, researchers & language communities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-netflix-gray hover:text-white flex items-center justify-center transition-all"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers (iOS 27 spatial pill segment) */}
        <div className="mt-5 p-1 rounded-full bg-white/5 border border-white/10 flex items-center relative z-10">
          <button
            onClick={() => setActiveTab("links")}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "links"
                ? "bg-netflix-red text-white shadow-netflix-glow"
                : "text-netflix-gray hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Social & Direct Link</span>
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "qr"
                ? "bg-netflix-red text-white shadow-netflix-glow"
                : "text-netflix-gray hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code (Mobile)</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === "links" ? (
          <div className="mt-5 space-y-4 relative z-10">
            {/* Quick 1-Click Copy Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-netflix-gray">
                Direct Project Link
              </label>
              <div className="flex items-center gap-2 p-1.5 pl-3.5 rounded-2xl bg-black/60 border border-white/10">
                <span className="text-xs text-netflix-light font-mono truncate flex-1">
                  {shareUrl}
                </span>
                <button
                  onClick={() => handleCopy(shareUrl)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    copied
                      ? "bg-emerald-500 text-black"
                      : "bg-netflix-red text-white hover:bg-netflix-red-hover shadow-netflix-glow"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Same Wi-Fi Mobile Sharing */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Smartphone className="w-4 h-4 text-netflix-red" />
                  <span>Share with friends on same Wi-Fi</span>
                </div>
                <button
                  onClick={() => handleCopy(lanUrl)}
                  className="text-[11px] font-mono text-netflix-red hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Wi-Fi URL</span>
                </button>
              </div>
              <p className="text-[11px] text-netflix-gray leading-relaxed">
                Friends connected to your local network can open Voice Roots directly at:
                <code className="block mt-1 px-2.5 py-1 rounded bg-black/50 text-cultural-gold font-mono text-xs select-all">
                  {lanUrl}
                </code>
              </p>
            </div>

            {/* Social Share Grid */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-netflix-gray">
                Share Instant Message
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-white text-xs font-semibold transition-all hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#0088cc]/15 hover:bg-[#0088cc]/25 border border-[#0088cc]/30 text-white text-xs font-semibold transition-all hover:scale-105"
                >
                  <Send className="w-4 h-4 text-[#0088cc]" />
                  <span>Telegram</span>
                </a>

                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all hover:scale-105"
                >
                  <span className="font-bold text-sm">𝕏</span>
                  <span>Twitter / X</span>
                </a>

                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#0077b5]/15 hover:bg-[#0077b5]/25 border border-[#0077b5]/30 text-white text-xs font-semibold transition-all hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 text-[#0077b5]" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Native Mobile Share API */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>More Share Options...</span>
              </button>
            )}
          </div>
        ) : (
          /* QR Code Tab */
          <div className="mt-5 space-y-4 text-center relative z-10">
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 inline-block shadow-inner mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSvgUrl}
                alt="Voice Roots QR Code"
                width={200}
                height={200}
                className="rounded-xl mx-auto border border-white/10"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                Scan with phone camera
              </h4>
              <p className="text-xs text-netflix-gray max-w-xs mx-auto">
                Point any smartphone camera at this QR code to instantly launch Voice Roots on mobile without typing the address.
              </p>
            </div>
          </div>
        )}

        {/* Footer info pill */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-netflix-gray relative z-10">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cultural-gold" />
            <span>Rooting Oral Languages in Text</span>
          </span>
          <span className="text-netflix-red font-semibold">24 Languages</span>
        </div>
      </div>
    </div>
  );
}
