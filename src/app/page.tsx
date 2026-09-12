"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  BookOpen,
  RotateCcw,
  Globe,
  HelpCircle,
  ChevronRight,
  Layers,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatResponse } from "@/types";

const SUGGESTED_CARDS = [
  {
    category: "Basic Concepts",
    title: "Data vs Information & Knowledge",
    description: "What are raw facts vs processed information and the data processing cycle?",
    question: "What is the difference between Data and Information, and how does data processing convert them into knowledge?",
    badge: "Lecture 2 • p. 7",
  },
  {
    category: "System Design",
    title: "Advantages of DBMS vs File System",
    description: "How does DBMS solve data redundancy, inconsistency, and atomicity problems?",
    question: "What are the main advantages of DBMS over traditional file-oriented systems?",
    badge: "Lecture 3 • p. 8-16",
  },
  {
    category: "Architecture",
    title: "Three Levels of Data Abstraction",
    description: "Explain Physical, Logical, and View levels and physical data independence.",
    question: "Explain the three levels of data abstraction in a DBMS and what is physical data independence.",
    badge: "Lecture 4 • p. 18-20",
  },
  {
    category: "Data Modeling",
    title: "ER Modeling & Cardinality (1:1, 1:N, M:N)",
    description: "Entities, weak entities, attributes, and relationship cardinality with examples.",
    question: "What is ER modeling and what are the four relationship cardinalities (1:1, 1:N, M:1, M:N)?",
    badge: "Lecture 6 • p. 34-41",
  },
];

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState<string>("");
  const [mode, setMode] = useState<"online" | "offline">("offline");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (overrideQuestion?: string) => {
    const query = (overrideQuestion || inputQuestion).trim();
    if (!query || isLoading) return;

    setErrorNotice(null);
    setInputQuestion("");

    const userMessageId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          mode: mode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = (await res.json()) as ChatResponse;

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.answer,
        mode: data.mode,
        retrievalSource: data.retrievalSource,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat request failed:", err);
      setErrorNotice(err.message || "Failed to process query. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorNotice(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl dumroo-gradient flex items-center justify-center text-white shadow-md">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span className="text-sm font-black tracking-tighter">∞</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-blue-950">
                  Book
                </span>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-amber-500">
                  .ai
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-500 font-medium -mt-0.5 truncate">
                AI Ecosystem for Education • Book Q&A
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/70">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800 whitespace-nowrap">
                DBMS Lecture Notes
              </span>
            </div>

            <ModeToggle mode={mode} onChange={(newMode) => setMode(newMode)} />

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-36 sm:pb-32 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 max-w-5xl leading-tight px-2">
              Ask anything about{" "}
              <span className="dumroo-gradient-text">DBMS Lecture Notes</span>
            </h1>

            <div className="w-full mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 text-left max-w-3xl">
              {SUGGESTED_CARDS.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(card.question)}
                  className="group relative p-3.5 sm:p-4 rounded-2xl bg-white/90 hover:bg-white border border-slate-200/90 hover:border-blue-300 dumroo-card-shadow transition-all duration-200 hover:-translate-y-0.5 text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 tracking-wider uppercase">
                        {card.category}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60 whitespace-nowrap">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:text-amber-500">
                    <span>Ask this question</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4 py-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-start gap-2.5 sm:gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl dumroo-gradient flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <span className="font-bold text-xs tracking-tighter">B.ai</span>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-sm bg-white border border-slate-200/80 dumroo-card-shadow flex items-center gap-3 max-w-[85%] sm:max-w-none">
                  <div className="flex gap-1.5 items-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {mode === "offline"
                      ? "Embedding locally with all-MiniLM-L6-v2 & matching 310 chunks..."
                      : "Embedding query & synthesizing answer with citations..."}
                  </span>
                </div>
              </div>
            )}

            {errorNotice && (
              <div className="p-3 sm:p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2 sm:gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="flex-1">{errorNotice}</span>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="font-semibold underline hover:text-red-900 shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-white/95 backdrop-blur-md rounded-full border border-slate-200/90 dumroo-pill-shadow transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
          >
            <div className="flex items-center pl-1 sm:pl-2 gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setMode(mode === "online" ? "offline" : "online")}
                className={`p-1.5 rounded-full transition-colors shrink-0 hover:cursor-pointer ${mode === "online"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600"
                  }`}
                title={`Current Mode: ${mode === "online" ? "Online Cloud LLM" : "Offline Local Extractive"}. Click to toggle.`}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                mode === "offline"
                  ? "Ask Dumroo.ai (Offline Mode)..."
                  : "Ask Dumroo.ai (Online Mode)..."
              }
              className="flex-1 min-w-0 bg-transparent px-1.5 sm:px-2 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60 font-sans"
            />

            <div className="flex items-center gap-1.5 pr-1 shrink-0">
              <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">
                {mode === "online" ? "Online" : "Offline"}
              </span>

              <button
                type="submit"
                disabled={isLoading || !inputQuestion.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full dumroo-gradient flex items-center justify-center text-white shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                title="Send Question"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>

          <div className="text-center mt-2 px-2">
            <span className="text-[9px] sm:text-[11px] text-slate-500 font-medium">
              Every answer includes exact page citations from the page textbook.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}