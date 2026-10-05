"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Bot, User, Bookmark, ExternalLink } from "lucide-react";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; sources?: string[] }>
  >([
    {
      sender: "ai",
      text: "Namaste! I am the Voice Roots Archive Assistant. I can help you search oral narratives, explain regional dialect vocabulary, and synthesize cultural knowledge directly from community recordings.",
      sources: ["Archive Index (18 Languages, 4,821 Recordings)"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setQuery("");
    setIsLoading(true);

    // Simulate RAG grounded search
    setTimeout(() => {
      let aiResponse = "";
      let sources: string[] = [];

      if (textToSend.toLowerCase().includes("farm") || textToSend.toLowerCase().includes("harvest")) {
        aiResponse =
          "According to the recorded Telugu and Koya oral archives, traditional agriculture relies on collective 'Bhoomi Pooja' (Earth reverence) before the first monsoon shower. Elders track the migration of local birds and the blossoming of neem trees to predict precipitation patterns.";
        sources = ["VR-10492: Traditional Harvest Ceremony (Telugu)", "VR-0842: Rain Song & Sowing (Koya Agency)"];
      } else if (textToSend.toLowerCase().includes("song") || textToSend.toLowerCase().includes("wedding")) {
        aiResponse =
          "In the Gondi oral tradition, wedding songs are sung antiphonally (call-and-response) between matrilineal elders. The lyrics recount tribal genealogy and blessings for fertile land and seasonal harmony.";
        sources = ["VR-3910: Gondi Matrilineal Wedding Chants", "VR-2041: Songs of the Forest Clans"];
      } else {
        aiResponse = `Based on semantic retrieval across the Voice Roots repository for "${textToSend}", 4 community recordings discuss this topic with high consensus. The narratives emphasize communal memory and oral transmission across generations.`;
        sources = ["VR-10492: Village Elder Interview", "VR-7821: Northern Dialect Conversation"];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiResponse,
          sources,
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-root-green text-obsidian font-semibold text-sm shadow-glow hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 fill-current animate-spin" />
          <span>Ask Voice Roots AI</span>
        </button>
      )}

      {/* Slide-over / Sheet Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[540px] glass-surface rounded-3xl border border-white/10 shadow-glass flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-root-green/20 border border-root-green/40 flex items-center justify-center text-leaf-green">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Voice Roots RAG AI</h4>
                <p className="text-[10px] font-mono text-leaf-green">Grounded in Preserved Transcripts</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-secondary-text hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={() => handleSend("Tell me about farming traditions")}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-secondary-text hover:text-white whitespace-nowrap"
            >
              🌾 Farming Traditions
            </button>
            <button
              onClick={() => handleSend("Explain Gondi wedding songs")}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-secondary-text hover:text-white whitespace-nowrap"
            >
              🎵 Wedding Songs
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-root-green/20 text-leaf-green flex-shrink-0 flex items-center justify-center text-[10px] mt-0.5">
                    🌱
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-root-green text-obsidian font-medium rounded-tr-none"
                      : "bg-surface-raised border border-white/5 text-primary-text rounded-tl-none space-y-2"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-leaf-green block">
                        Retrieved Archive Evidence:
                      </span>
                      {m.sources.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-1 text-[10px] text-secondary-text/90 italic"
                        >
                          <Bookmark className="w-2.5 h-2.5 text-root-green flex-shrink-0" />
                          <span className="truncate">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 text-secondary-text text-xs italic items-center">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-root-green" />
                <span>Searching vector archive & synthesizing evidence...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 bg-black/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything about the archive..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-root-green/50 placeholder:text-secondary-text/50"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-full bg-root-green text-obsidian hover:bg-leaf-green transition-transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
