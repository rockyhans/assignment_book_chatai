"use client";

import React, { useState } from "react";
import { Copy, Check, Sparkles, Cpu, User, Database } from "lucide-react";
import { SourceCitation } from "./SourceCitation";
import { SourceCitationData } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: "online" | "offline";
  retrievalSource?: "supabase" | "chroma" | "in-memory";
  sources?: SourceCitationData[];
  timestamp?: string;
}

interface ChatMessageProps {
  message: Message;
}

// Parses **bold** and `inline code` within a single line/paragraph of text.


// Renders a block of text (no code fences inside it) — paragraphs, bullet
// lists, numbered lists, and basic headings — with inline markdown parsing.




export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isAssistant = message.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAssistant) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200 px-1 sm:px-0">
        <div className="flex items-start gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md text-sm font-normal leading-relaxed break-words">
            {message.content}
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5 border border-slate-300">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    );
  }


  function renderFormattedContent(content: string) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-4 mb-2">
              {children}
            </h3>
          ),

          h2: ({ children }) => (
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2">
              {children}
            </h4>
          ),

          h3: ({ children }) => (
            <h5 className="text-sm sm:text-base font-bold text-slate-900 mt-3 mb-2">
              {children}
            </h5>
          ),

          p: ({ children }) => (
            <p className="leading-relaxed mb-3 last:mb-0 break-words">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),

          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2 space-y-1">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="leading-relaxed break-words">
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-300 pl-3 my-3 text-slate-600 italic">
              {children}
            </blockquote>
          ),

          hr: () => (
            <hr className="my-4 border-slate-200" />
          ),

          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");

            if (isBlock) {
              return (
                <code className="font-mono text-xs sm:text-sm">
                  {children}
                </code>
              );
            }

            return (
              <code className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 text-slate-800 text-[0.85em] font-mono break-words">
                {children}
              </code>
            );
          },

          pre: ({ children }) => (
            <pre className="my-3 p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs sm:text-sm max-w-full">
              {children}
            </pre>
          ),

          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[500px] border-collapse text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-100">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),

          tr: ({ children }) => (
            <tr className="border-b border-slate-200 last:border-b-0">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-800 border-r border-slate-200 last:border-r-0">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-3 py-2 align-top text-slate-700 border-r border-slate-200 last:border-r-0">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  return (
    <div className="flex justify-start w-full mb-5 sm:mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200 px-0 sm:px-0">
      <div
        className="
        flex items-start
        w-full
        gap-2 sm:gap-3
        max-w-full md:max-w-[85%]
      "
      >
        {/* Dumroo Avatar - hidden on mobile */}
        <div
          className="
          hidden sm:flex
          w-9 h-9
          rounded-xl
          dumroo-gradient
          items-center
          justify-center
          text-white
          shadow-md
          flex-shrink-0
          mt-1
        "
        >
          <span className="font-bold text-xs tracking-tighter">
            B.ai
          </span>
        </div>

        {/* Message Card */}
        <div
          className="
          w-full
          min-w-0
          flex-1
          bg-white/95
          backdrop-blur-sm
          rounded-2xl
          rounded-tl-sm
          p-3
          sm:p-4
          md:p-5
          border
          border-slate-200/80
          dumroo-card-shadow
          overflow-hidden
        "
        >
          {/* Header */}
          <div
            className="
            flex
            items-center
            justify-between
            gap-2
            mb-3
            pb-2
            border-b
            border-slate-100
            min-w-0
          "
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className="
                font-bold
                text-xs
                text-slate-800
                tracking-tight
                whitespace-nowrap
                shrink-0
              "
              >
                Dumroo Assistant
              </span>

              {message.mode === "online" ? (
                <>
                  <span
                    className="
                    inline-flex
                    items-center
                    gap-1
                    px-2
                    py-0.5
                    rounded-full
                    text-[10px]
                    sm:text-[11px]
                    font-semibold
                    bg-blue-50
                    text-blue-700
                    border
                    border-blue-200
                    whitespace-nowrap
                    shrink-0
                  "
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />

                    {/* Shorter on mobile */}
                    <span className="sm:hidden">
                      Online
                    </span>

                    <span className="hidden sm:inline">
                      Online Generative
                    </span>
                  </span>

                  {message.retrievalSource === "supabase" && (
                    <span
                      className="
                      inline-flex
                      items-center
                      gap-1
                      px-2
                      py-0.5
                      rounded-full
                      text-[10px]
                      sm:text-[11px]
                      font-semibold
                      bg-emerald-50
                      text-emerald-700
                      border
                      border-emerald-200
                      whitespace-nowrap
                      shrink-0
                    "
                      title="Retrieved live from Supabase PostgreSQL pgvector"
                    >
                      <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Supabase pgvector</span>
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="
                  inline-flex
                  items-center
                  gap-1
                  px-2
                  py-0.5
                  rounded-full
                  text-[10px]
                  sm:text-[11px]
                  font-semibold
                  bg-amber-50
                  text-amber-800
                  border
                  border-amber-200
                  whitespace-nowrap
                  shrink-0
                "
                >
                  <Cpu className="w-3 h-3 text-amber-600 shrink-0" />

                  {/* Shorter on mobile */}
                  <span className="sm:hidden">
                    Offline
                  </span>

                  <span className="hidden sm:inline">
                    Offline Extractive
                  </span>
                </span>
              )}
            </div>

            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className="
              p-1.5
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              rounded-md
              transition-colors
              shrink-0
            "
              title="Copy answer"
              aria-label="Copy answer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Answer Text */}
          <div
            className="
            text-sm
            text-slate-800
            leading-relaxed
            space-y-2
            min-w-0
            max-w-full
            overflow-hidden
            break-words
          "
          >
            {renderFormattedContent(message.content)}
          </div>

          {/* Source Citations */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 min-w-0 max-w-full overflow-hidden">
              <SourceCitation sources={message.sources} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};