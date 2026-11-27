"use client";

import { useState } from "react";
import { generateAiEmailHtmlAction } from "@/features/communication/ai-actions";
import {
  type EmailTemplateItem,
  defaultBuiltInTemplates,
} from "@/features/communication/ai-types";

interface Props {
  currentSubject?: string;
  onApplyHtml: (html: string) => void;
  onUndoRestoreOriginal?: (originalDraft: string) => void;
  onOpenSettings?: () => void;
  onOpenTemplatesManager?: () => void;
  templates?: EmailTemplateItem[];
  collegeName?: string;
  logoUrl?: string;
}

export default function AiEmailGenerator({
  currentSubject = "",
  onApplyHtml,
  onUndoRestoreOriginal,
  onOpenSettings,
  onOpenTemplatesManager,
  templates = defaultBuiltInTemplates,
  collegeName = "Haji Rahmatullah Model Degree College",
  logoUrl,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || "royal_institutional"
  );
  const [showStylePreview, setShowStylePreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastGeneratedHtml, setLastGeneratedHtml] = useState<string | null>(null);
  const [hasAppliedAi, setHasAppliedAi] = useState(false);

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0] || defaultBuiltInTemplates[0];

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
        style: activeTemplate.category,
        templateId: activeTemplate.id,
        customPromptInstructions: activeTemplate.aiPromptInstructions,
        primaryColor: activeTemplate.primaryColor,
        accentColor: activeTemplate.accentColor,
        badgeLabel: activeTemplate.badgeLabel,
      });

      if (res.success && res.html) {
        setLastGeneratedHtml(res.html);
        setHasAppliedAi(true);
        onApplyHtml(res.html);
        setSuccessMsg("✨ Stunning responsive HTML generated & loaded into editor!");
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

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-blue-50/60 p-4 shadow-xs transition-all">
      {/* Header */}
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
                Phone & PC Responsive
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Type plain text or notes — AI transforms it into a mobile & desktop compatible HTML email matching your selected style.
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
          {/* Style Selector with Manage Templates link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                1. Select Design Style / Template:
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowStylePreview(!showStylePreview)}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>👁️</span>
                  <span>{showStylePreview ? "Hide Style Preview" : "Example Style Preview"}</span>
                </button>

                {onOpenTemplatesManager && (
                  <button
                    type="button"
                    onClick={onOpenTemplatesManager}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>🎨</span>
                    <span>Manage / Add Templates</span>
                  </button>
                )}
              </div>
            </div>

            {/* Template Card Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {templates.map((tpl) => {
                const isSelected = activeTemplate.id === tpl.id;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-white ring-2 ring-indigo-500 shadow-xs"
                        : "border-gray-200 bg-white/75 hover:bg-white text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: tpl.primaryColor }}
                        />
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {tpl.name}
                        </span>
                      </div>
                      <span
                        className="rounded px-1.5 py-0.2 text-[9px] font-black uppercase"
                        style={{
                          backgroundColor: `${tpl.primaryColor}15`,
                          color: tpl.primaryColor,
                        }}
                      >
                        {tpl.badgeLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Style Preview (Phone / PC Toggle) */}
          {showStylePreview && (
            <div className="rounded-2xl border border-indigo-200 bg-white p-4 space-y-3 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👁️</span>
                  <span className="text-xs font-bold text-gray-900">
                    Style Preview: {activeTemplate.name}
                  </span>
                </div>

                <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500"
                    }`}
                  >
                    💻 PC View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500"
                    }`}
                  >
                    📱 Phone View
                  </button>
                </div>
              </div>

              {/* Responsive Container */}
              <div
                className={`mx-auto bg-gray-50 p-3 rounded-xl border border-gray-200 transition-all flex justify-center ${
                  previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                }`}
              >
                <div
                  className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200"
                  style={{
                    maxWidth: previewDevice === "mobile" ? "340px" : "540px",
                  }}
                >
                  {/* Banner */}
                  <div
                    style={{
                      backgroundColor: activeTemplate.primaryColor,
                      padding: previewDevice === "mobile" ? "18px 14px" : "24px 20px",
                    }}
                    className="text-white text-center"
                  >
                    {logoUrl && (
                      <div className="flex justify-center mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoUrl}
                          alt={collegeName}
                          className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-white/80 shadow-md"
                        />
                      </div>
                    )}
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                      {collegeName}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                      {activeTemplate.badgeLabel}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2.5 bg-white text-xs">
                    <h4 className="font-extrabold text-sm text-gray-900">
                      {activeTemplate.sampleSubject || "Official Campus Notice & Schedule"}
                    </h4>
                    <p className="text-gray-600 text-[11px] leading-relaxed">
                      {activeTemplate.sampleBody ||
                        "This example shows the balanced typography, inline icons, and fluid layout generated for this style on both mobile and desktop screens."}
                    </p>

                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        borderLeft: `3px solid ${activeTemplate.primaryColor}`,
                      }}
                      className="rounded p-2.5 text-[11px] space-y-1 text-gray-700"
                    >
                      <div className="font-bold text-[10px] text-gray-500 uppercase">
                        📌 Example Highlights:
                      </div>
                      <div>📅 <strong>Date:</strong> Upcoming Academic Session</div>
                      <div>⏰ <strong>Time:</strong> 09:00 AM Sharp</div>
                    </div>

                    <div className="pt-1 text-center">
                      <span
                        style={{ backgroundColor: activeTemplate.primaryColor }}
                        className="inline-block rounded-lg px-4 py-1.5 text-[11px] font-bold text-white shadow-2xs"
                      >
                        Action Button &rarr;
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 border-t border-gray-100 p-2 text-center text-[9px] text-gray-400">
                    Office of Administration • {collegeName}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draft Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                2. Type Your Rough Plain Text or Draft Notes:
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
              💡 Fully compatible with smartphones and desktop PCs. Automatically applied to editor below.
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

              {/* Primary Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin text-sm">✨</span>
                    <span>Formatting Mobile & PC HTML…</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Format & Generate HTML</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
