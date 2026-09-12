"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, Cloud, Cpu, Info } from "lucide-react";

interface ModeToggleProps {
  mode: "online" | "offline";
  onChange: (newMode: "online" | "offline") => void;
  compact?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onChange,
  compact = false,
}) => {
  const [networkOnline, setNetworkOnline] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setNetworkOnline(navigator.onLine);

      const handleOnline = () => setNetworkOnline(true);

      const handleOffline = () => {
        setNetworkOnline(false);
        onChange("offline");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [onChange]);

  if (compact) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={() =>
            onChange(mode === "online" ? "offline" : "online")
          }
          className={`
            group flex items-center justify-center gap-1.5
            px-2.5 sm:px-3
            py-1.5
            rounded-full
            text-xs font-semibold
            whitespace-nowrap
            transition-all duration-200
            border
            ${mode === "online"
              ? "bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "bg-amber-50/90 text-amber-800 border-amber-200 hover:bg-amber-100"
            }
          `}
          title={`Click to switch to ${mode === "online" ? "Offline" : "Online"
            } mode`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${mode === "online"
              ? "bg-emerald-500 animate-pulse"
              : "bg-amber-500"
              }`}
          />

          {mode === "online" ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Online</span>
            </>
          ) : (
            <>
              <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Offline</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-end">
      <div
        className="
          inline-flex items-center
          p-1
          bg-slate-100/90
          rounded-full
          border border-slate-200/80
          shadow-inner
          max-w-full
        "
      >
        <button
          type="button"
          onClick={() => onChange("offline")}
          aria-label="Switch to Offline mode"
          className={`
            flex items-center justify-center
            gap-1.5 sm:gap-2
            px-2 sm:px-3.5
            py-1.5
            rounded-full
            text-xs font-semibold
            whitespace-nowrap
            transition-all duration-200
            ${mode === "offline"
              ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
              : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          <span
            className={`
              w-1.5 h-1.5 sm:w-2 sm:h-2
              rounded-full
              shrink-0
              ${mode === "offline"
                ? "bg-amber-500"
                : "bg-slate-300"
              }
            `}
          />

          <Cpu className="w-3.5 h-3.5 text-amber-600 shrink-0" />

          <span className="sm:hidden">Offline</span>

          <span className="hidden sm:inline">
            Offline Extractive
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("online")}
          aria-label="Switch to Online mode"
          className={`
            flex items-center justify-center
            gap-1.5 sm:gap-2
            px-2 sm:px-3.5
            py-1.5
            rounded-full
            text-xs font-semibold
            whitespace-nowrap
            transition-all duration-200
            ${mode === "online"
              ? "bg-white text-blue-700 shadow-sm border border-blue-200/80"
              : "text-slate-500 hover:text-slate-800"
            }
          `}
        >
          <span
            className={`
              w-1.5 h-1.5 sm:w-2 sm:h-2
              rounded-full
              shrink-0
              ${mode === "online"
                ? "bg-emerald-500 animate-pulse"
                : "bg-slate-300"
              }
            `}
          />

          <Cloud className="w-3.5 h-3.5 text-blue-600 shrink-0" />

          <span className="sm:hidden">Online</span>

          <span className="hidden sm:inline">
            Online (Cloud LLM)
          </span>
        </button>
      </div>

      {showHelp && (
        <div className="absolute top-14 right-0 z-50 w-[min(18rem,calc(100vw-2rem))] p-3 bg-white/95 rounded-xl border border-slate-200 shadow-xl text-xs text-slate-700 space-y-2 backdrop-blur-md animate-in fade-in zoom-in-95">
          <div className="font-semibold text-slate-900 flex items-center justify-between">
            <span>RAG Modes Explained</span>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
              aria-label="Close help"
            >
              ✕
            </button>
          </div>

          <p>
            <strong className="text-blue-700">
              Online Mode:
            </strong>{" "}
            Embeds queries via cloud API and uses an LLM
            (Gemini/OpenAI) to synthesize a pedagogical answer
            citing book pages.
          </p>

          <p>
            <strong className="text-amber-700">
              Offline Mode:
            </strong>{" "}
            Runs 100% locally with
            Xenova/all-MiniLM-L6-v2. Directly extracts the most
            relevant textbook passage with zero external API
            calls.
          </p>
        </div>
      )}
    </div>
  );
};