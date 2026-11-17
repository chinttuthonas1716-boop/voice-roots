"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Volume2,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  FileCode,
  Mic,
  Languages,
  CheckCircle2,
  HelpCircle,
  Activity,
} from "lucide-react";

interface NavAction {
  label: string;
  href: string;
  badge?: string;
}

interface Citation {
  citation_id: string;
  title: string;
  language: string;
  dialect?: string;
  attribution?: string;
  excerpt?: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  navigation?: NavAction | null;
  actions?: NavAction[];
  citations?: Citation[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: "🌐 Translate Gondi", query: "How do I translate English to Gondi?" },
  { label: "📦 Download Source Code", query: "Where can I download the full project ZIP?" },
  { label: "📚 Swagger API Docs", query: "Where are the interactive API docs?" },
  { label: "🎙️ Record Audio", query: "How do I record my voice under OCAP protocols?" },
  { label: "🛡️ What is OCAP?", query: "What is the OCAP protocol and why is Gondi restricted?" },
  { label: "📊 What is WER & CER?", query: "Explain Word Error Rate and Character Error Rate in Voice Roots" },
];

export function AINavigationBot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 **Sewa Johar! Welcome to Voice Roots.**\n\nI am your **AI Guide & Navigation Assistant**. I can help you translate languages, download the project, explore API docs, or understand Indigenous Data Sovereignty (OCAP®) protocols.",
      navigation: { label: "🌐 Open Multilingual Translator", href: "/translate", badge: "Live v2.0" },
      actions: [
        { label: "📦 Download Source ZIP", href: "/download" },
        { label: "📚 API Docs", href: "/docs" },
        { label: "🎙️ Record Voice", href: "/record" },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const resp = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!resp.ok) {
        throw new Error(`Query failed: ${resp.status}`);
      }

      const data = await resp.json();

      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: data.answer || "I processed your request.",
        navigation: data.navigation || null,
        actions: data.actions || [],
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        text: "I am having trouble reaching the local assistant server right now. Here are quick links to navigate anywhere in Voice Roots:",
        navigation: { label: "🌐 Translator", href: "/translate" },
        actions: [
          { label: "📦 Download Hub", href: "/download" },
          { label: "📚 API Docs", href: "/docs" },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`[\]()]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNavigate = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      router.push(href);
      setIsOpen(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome_reset",
        sender: "bot",
        text: "Chat cleared! How can I assist you with Voice Roots today?",
        navigation: { label: "🌐 Open Translator", href: "/translate" },
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Navigation and Help Bot"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2.5 rounded-full border border-[#A6C48A]/40 bg-gradient-to-r from-[#102B20]/95 to-[#1F5138]/95 px-4 py-2.5 text-sm font-semibold text-[#F5F3E9] shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#A6C48A] hover:shadow-[#A6C48A]/25"
        >
          <div className="relative">
            <Bot className="h-5 w-5 text-[#A6C48A] group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A6C48A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A6C48A]" />
            </span>
          </div>
          <span className="font-medium tracking-wide">AI Guide &amp; Help</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#A6C48A]/20 text-[#A6C48A]">
            Bot
          </span>
        </button>
      )}

      {/* Floating Bot Window */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bot-title"
            className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col max-h-[85vh] sm:max-h-[640px] w-auto sm:w-[420px] rounded-3xl border border-[#A6C48A]/35 bg-[#071A13]/95 shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#A6C48A]/20 bg-gradient-to-r from-[#102B20] to-[#071A13] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-[#A6C48A]/30 bg-[#1F5138]/60 text-[#A6C48A] shadow-inner">
                  <Bot className="h-5 w-5" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#071A13]" />
                </div>
                <div>
                  <h3 id="bot-title" className="text-sm font-bold text-[#F5F3E9] flex items-center gap-1.5">
                    <span>Voice Roots AI Guide</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#A6C48A]/20 text-[#A6C48A] font-semibold">
                      Online
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#DCE9D7]/70">Interactive Navigation &amp; Help Bot</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset Conversation"
                  className="p-1.5 rounded-lg text-[#DCE9D7]/70 hover:text-[#F5F3E9] hover:bg-white/10 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Guide Bot"
                  className="p-1.5 rounded-lg text-[#DCE9D7]/70 hover:text-[#F5F3E9] hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Strip */}
            <div className="border-b border-[#A6C48A]/15 bg-[#102B20]/50 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
              <span className="text-[10px] text-[#A6C48A] font-semibold uppercase tracking-wider shrink-0 pl-1">
                Quick Help:
              </span>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(qp.query)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-[#071A13] border border-[#A6C48A]/25 text-[#DCE9D7] hover:bg-[#1F5138] hover:text-[#F5F3E9] transition"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  } space-y-1`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#1F5138] text-[#F5F3E9] rounded-tr-sm border border-[#A6C48A]/30 shadow-md"
                        : "bg-[#102B20]/90 text-[#DCE9D7] rounded-tl-sm border border-[#A6C48A]/20 shadow-md"
                    }`}
                  >
                    {/* Render message with line breaks and markdown bold */}
                    <div className="space-y-2 whitespace-pre-line">
                      {msg.text.split("\n\n").map((para, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Primary Navigation Button */}
                    {msg.navigation && (
                      <div className="mt-3 pt-2.5 border-t border-[#A6C48A]/20">
                        <button
                          type="button"
                          onClick={() => handleNavigate(msg.navigation!.href)}
                          className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#A6C48A] text-[#071A13] font-bold text-xs hover:bg-[#DCE9D7] transition shadow"
                        >
                          <span>{msg.navigation.label}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Secondary Action Chips */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => handleNavigate(act.href)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#071A13] border border-[#A6C48A]/30 text-[11px] font-semibold text-[#A6C48A] hover:bg-[#1F5138] hover:text-[#F5F3E9] transition"
                          >
                            <span>{act.label}</span>
                            {act.href.startsWith("http") ? (
                              <ExternalLink className="h-3 w-3" />
                            ) : (
                              <ArrowRight className="h-3 w-3" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Grounded Citation Pills */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#A6C48A]/15 space-y-1.5">
                        <span className="text-[10px] font-semibold text-[#A6C48A] uppercase tracking-wider block">
                          Verified Community Sources:
                        </span>
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2 rounded-lg bg-[#071A13]/80 border border-[#A6C48A]/15 text-[11px] text-[#DCE9D7]/80"
                          >
                            <span className="font-semibold text-[#F5F3E9] block">{c.title}</span>
                            <span className="text-[10px] text-[#A6C48A]">
                              {c.language} ({c.dialect || "Native"}) · {c.attribution || "Community Council"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Speech Speak Button for Bot Responses */}
                    {msg.sender === "bot" && (
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#A6C48A]/60 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.text)}
                          className="inline-flex items-center gap-1 hover:text-[#A6C48A] transition"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>{isSpeaking ? "Stop Voice" : "Listen aloud"}</span>
                        </button>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#102B20]/60 border border-[#A6C48A]/20 max-w-[70%]">
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 rounded-full bg-[#A6C48A] animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-[#A6C48A] animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-[#A6C48A] animate-bounce" />
                  </div>
                  <span className="text-xs text-[#DCE9D7]/70">Checking local archive...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-[#A6C48A]/20 bg-[#102B20]/90 p-3"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask where to go or how something works..."
                className="flex-1 min-h-[44px] rounded-xl border border-[#A6C48A]/25 bg-[#071A13] px-3.5 text-xs sm:text-sm text-[#F5F3E9] placeholder-[#DCE9D7]/40 focus:border-[#A6C48A] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                aria-label="Send query"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#A6C48A] text-[#071A13] hover:bg-[#DCE9D7] disabled:opacity-40 transition shadow"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
