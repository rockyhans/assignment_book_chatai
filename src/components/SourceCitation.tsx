"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Copy, Check, ExternalLink } from "lucide-react";
import { SourceCitationData } from "@/types";

interface SourceCitationProps {
  sources: SourceCitationData[];
}

export const SourceCitation: React.FC<SourceCitationProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!sources || sources.length === 0) {
    return null;
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract unique pages for quick summary
  const uniquePages = Array.from(new Set(sources.map((s) => s.page))).sort((a, b) => a - b);
  const pagesSummary = uniquePages.map((p) => `p. ${p}`).join(", ");

  return (
    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex flex-col gap-2 sm:flex-row items-center justify-between px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors border border-slate-200/70 text-left group"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <BookOpen className="w-4 h-4 text-blue-600 group-hover:text-amber-500 transition-colors" />
          <span className="font-semibold text-slate-900">
            {sources.length} Cited {sources.length === 1 ? "Source" : "Sources"}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 text-[11px] truncate max-w-[240px]">
            {pagesSummary}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <span>{isOpen ? "Hide citations" : "View citations"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Citations List */}
      {isOpen && (
        <div className="mt-2.5 space-y-2.5 pl-1 animate-in fade-in duration-200">
          {sources.map((source, index) => {
            const similarityPercent = Math.round(source.similarity * 100);
            return (
              <div
                key={source.chunkId || index}
                className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-sm hover:border-blue-300/80 transition-all duration-150"
              >
                {/* Source Metadata Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Page {source.page}
                    </span>
                    {source.sectionTitle && (
                      <span
                        className="text-xs font-medium text-slate-700 max-w-[280px] truncate"
                        title={source.sectionTitle}
                      >
                        {source.sectionTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {source.similarity > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {similarityPercent}% match
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(source.chunkId, source.snippet)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Copy excerpt"
                    >
                      {copiedId === source.chunkId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Excerpt Snippet */}
                <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/70 p-2.5 rounded-lg border-l-2 border-amber-400 font-sans">
                  &ldquo;{source.snippet}&rdquo;
                </p>

                {/* Chunk ID metadata */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>ID: {source.chunkId}</span>
                  <span className="flex items-center gap-0.5">
                    Verified from Book Index <ExternalLink className="w-2.5 h-2.5 inline" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
