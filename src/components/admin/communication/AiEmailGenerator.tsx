"use client";

import { useState } from "react";
import { generateAiEmailHtmlAction } from "@/features/communication/ai-actions";

interface Props {
  currentSubject?: string;
  onApplyHtml: (html: string) => void;
  onUndoRestoreOriginal?: (originalDraft: string) => void;
  onOpenSettings?: () => void;
}

export default function AiEmailGenerator({
  currentSubject = "",
  onApplyHtml,
  onUndoRestoreOriginal,
  onOpenSettings,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<
    "institutional" | "urgent" | "celebration" | "clean"
  >("institutional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastGeneratedHtml, setLastGeneratedHtml] = useState<string | null>(null);
  const [hasAppliedAi, setHasAppliedAi] = useState(false);

  const handleGenerate = async () => {
    if (!rawText.trim()) {
      setErrorMsg("Please enter your rough draft or notes first.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await generateAiEmailHtmlAction({
        rawText,
        subject: currentSubject,
        style: selectedStyle,
      });

      if (res.success && res.html) {
        setLastGeneratedHtml(res.html);
        setHasAppliedAi(true);
        onApplyHtml(res.html);
        setSuccessMsg("✨ Stunning HTML generated & loaded into editor!");
      } else {
        setErrorMsg(res.error || "Failed to generate email template.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate email template.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUndoRestore = () => {
    if (onUndoRestoreOriginal) {
      onUndoRestoreOriginal(rawText);
      setHasAppliedAi(false);
      setSuccessMsg("↩️ Removed HTML template & restored your original text into editor.");
    }
  };

  const styles = [
    {
      id: "institutional",
      label: "🏛️ Official Institutional",
      desc: "Deep navy & gold header, formal typography, official sign-off.",
    },
    {
      id: "urgent",
      label: "🚨 Urgent Alert",
      desc: "High-contrast alert banners, emergency highlights & deadlines.",
    },
    {
      id: "celebration",
      label: "🎉 Event / Celebration",
      desc: "Festive banners, vibrant accent cards, welcoming tone.",
    },
    {
      id: "clean",
      label: "📋 Clean Minimalist",
      desc: "Modern monochrome, sleek cards, ultra-readable layout.",
    },
  ];

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-blue-50/60 p-4 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-base shadow-sm">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">
                AI Email Beautifier & HTML Generator
              </h3>
              <span className="rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide">
                Google Gemini Studio
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Type rough plain text or notes — AI instantly designs a stunning, responsive HTML email.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs transition cursor-pointer"
        >
          {isOpen ? "▲ Hide AI Generator" : "▼ Open AI Generator"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-indigo-200/60 space-y-4 animate-fadeIn">
          {/* Style Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">
              Select Design Style:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStyle(s.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStyle === s.id
                      ? "border-indigo-600 bg-white ring-2 ring-indigo-500 shadow-xs"
                      : "border-gray-200 bg-white/70 hover:bg-white text-gray-600"
                  }`}
                >
                  <div className="font-bold text-xs text-gray-900">{s.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    {s.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Draft Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Paste or Type Your Rough Draft Text:
              </label>
              <span className="text-[10px] text-gray-400">
                Any raw text, dates, schedules, or bullets
              </span>
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Notice regarding upcoming college holidays and term exam schedule. College will remain closed from Sunday to Tuesday due to national holiday. Classes resume Wednesday at 9:00 AM. Routine will be published on the website..."
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none shadow-inner leading-relaxed"
            />
          </div>

          {/* Success / Status Message */}
          {successMsg && !errorMsg && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span className="font-semibold">{successMsg}</span>
              </div>
              {hasAppliedAi && (
                <button
                  type="button"
                  onClick={handleUndoRestore}
                  className="rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                >
                  ↩️ Undo Now
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="underline font-bold text-rose-900 hover:text-rose-950 shrink-0"
                >
                  Configure AI Keys →
                </button>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-gray-500">
              💡 The generated template will automatically load into the editor and preview below.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Undo / Restore Original Draft Button */}
              {hasAppliedAi && (
                <button
                  type="button"
                  onClick={handleUndoRestore}
                  className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  title="Remove the AI HTML template and restore your original plain draft text"
                >
                  <span>↩️</span>
                  <span>Undo / Restore Original Text</span>
                </button>
              )}

              {/* Regenerate Button */}
              {lastGeneratedHtml && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-2xs transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Regenerate HTML</span>
                </button>
              )}

              {/* Primary Generate Button (Shown if not generated yet) */}
              {!lastGeneratedHtml && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin text-sm">✨</span>
                      <span>Generating Stunning HTML…</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate HTML Email</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
