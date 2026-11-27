"use client";

import { useState, useTransition } from "react";
import type { EmailTemplateItem } from "@/features/communication/ai-types";
import {
  saveEmailTemplateAction,
  deleteEmailTemplateAction,
  resetEmailTemplatesAction,
} from "@/features/communication/ai-actions";

interface Props {
  initialTemplates: EmailTemplateItem[];
  onSelectTemplateForCompose?: (template: EmailTemplateItem) => void;
  collegeName?: string;
  logoUrl?: string;
}

export default function EmailTemplateManager({
  initialTemplates,
  onSelectTemplateForCompose,
  collegeName = "Haji Rahmatullah Model Degree College",
  logoUrl,
}: Props) {
  const [templates, setTemplates] = useState<EmailTemplateItem[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateItem>(
    initialTemplates[0] || null
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplateItem> | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      id: `custom-tpl-${Date.now()}`,
      name: "New Custom Email Template",
      category: "custom",
      badgeLabel: "OFFICIAL NOTICE",
      primaryColor: "#1e3a8a",
      accentColor: "#c5a46d",
      description: "Custom email template style with responsive layout for phone and PC.",
      sampleSubject: "Important Announcement: Event Schedule & Instructions",
      sampleBody:
        "Please note the following important schedule details for the upcoming session...",
      aiPromptInstructions:
        "Render with clean card sections, prominent action buttons, and clear bullet points.",
      isBuiltIn: false,
    });
    setIsEditing(true);
  };

  const handleEdit = (tpl: EmailTemplateItem) => {
    setEditingTemplate({ ...tpl });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingTemplate || !editingTemplate.name?.trim()) {
      showToast("error", "Please provide a valid template name.");
      return;
    }

    const tplToSave: EmailTemplateItem = {
      id: editingTemplate.id || `custom-tpl-${Date.now()}`,
      name: editingTemplate.name.trim(),
      category: editingTemplate.category || "custom",
      badgeLabel: editingTemplate.badgeLabel?.trim() || "NOTICE",
      primaryColor: editingTemplate.primaryColor || "#1e3a8a",
      accentColor: editingTemplate.accentColor || "#c5a46d",
      description: editingTemplate.description?.trim() || "",
      sampleSubject: editingTemplate.sampleSubject?.trim() || "Official Announcement",
      sampleBody: editingTemplate.sampleBody?.trim() || "",
      aiPromptInstructions: editingTemplate.aiPromptInstructions?.trim() || "",
      isBuiltIn: editingTemplate.isBuiltIn ?? false,
    };

    startTransition(async () => {
      const res = await saveEmailTemplateAction(tplToSave);
      if (res.success && res.template) {
        setTemplates((prev) => {
          const idx = prev.findIndex((t) => t.id === res.template!.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.template!;
            return next;
          }
          return [res.template!, ...prev];
        });
        setSelectedTemplate(res.template);
        setIsEditing(false);
        setEditingTemplate(null);
        showToast("success", `Template "${res.template.name}" saved successfully!`);
      } else {
        showToast("error", res.error || "Failed to save template.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteEmailTemplateAction(id);
      if (res.success) {
        const next = templates.filter((t) => t.id !== id);
        setTemplates(next);
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(next[0] || null);
        }
        showToast("success", `Template "${name}" deleted.`);
      } else {
        showToast("error", res.error || "Failed to delete template.");
      }
    });
  };

  const handleResetDefaults = () => {
    if (!confirm("Reset all templates back to default system templates?")) return;

    startTransition(async () => {
      const res = await resetEmailTemplatesAction();
      if (res.success && res.templates) {
        setTemplates(res.templates);
        setSelectedTemplate(res.templates[0]);
        showToast("success", "Templates reset to defaults.");
      } else {
        showToast("error", res.error || "Failed to reset templates.");
      }
    });
  };

  const quickColorPresets = [
    { label: "Navy & Gold", primary: "#1e3a8a", accent: "#c5a46d" },
    { label: "Crimson Alert", primary: "#b91c1c", accent: "#fee2e2" },
    { label: "Indigo & Purple", primary: "#4f46e5", accent: "#a855f7" },
    { label: "Emerald & Amber", primary: "#065f46", accent: "#d97706" },
    { label: "Slate Minimal", primary: "#0f172a", accent: "#0284c7" },
    { label: "Teal Modern", primary: "#0d9488", accent: "#ccfbf1" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-4 py-3 text-xs font-bold shadow-2xl border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h2 className="text-base font-bold text-gray-900">
              HTML Email Templates & Style Library
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage stunning, 100% phone & PC responsive email templates. The AI uses these styles to format raw text drafts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isPending}
            className="rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition cursor-pointer"
          >
            🔄 Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleCreateNew}
            disabled={isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span>
            <span>Add New Template</span>
          </button>
        </div>
      </div>

      {/* Editor Modal / Inline Drawer */}
      {isEditing && editingTemplate && (
        <div className="rounded-2xl border-2 border-blue-400 bg-white p-5 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✏️</span>
              <h3 className="text-sm font-bold text-gray-900">
                {editingTemplate.isBuiltIn ? "Customize Template Style" : "Create / Edit Template"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingTemplate(null);
              }}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Template Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editingTemplate.name || ""}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, name: e.target.value })
                }
                placeholder="e.g. 🏆 Annual Sports Day Notice"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 font-semibold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={editingTemplate.badgeLabel || ""}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, badgeLabel: e.target.value })
                }
                placeholder="e.g. OFFICIAL NOTICE, SPORTS FEST 2026"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Primary Brand Color (Banner & Buttons)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editingTemplate.primaryColor || "#1e3a8a"}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, primaryColor: e.target.value })
                  }
                  className="h-9 w-12 rounded-lg border border-gray-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={editingTemplate.primaryColor || "#1e3a8a"}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, primaryColor: e.target.value })
                  }
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Accent / Border Highlight Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editingTemplate.accentColor || "#c5a46d"}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, accentColor: e.target.value })
                  }
                  className="h-9 w-12 rounded-lg border border-gray-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={editingTemplate.accentColor || "#c5a46d"}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, accentColor: e.target.value })
                  }
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Quick Color Combinations:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickColorPresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setEditingTemplate({
                      ...editingTemplate,
                      primaryColor: preset.primary,
                      accentColor: preset.accent,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs hover:border-blue-400 cursor-pointer shadow-2xs"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span
                    className="h-3 w-3 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.accent }}
                  />
                  <span className="text-gray-700 font-medium">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description & Usage
            </label>
            <input
              type="text"
              value={editingTemplate.description || ""}
              onChange={(e) =>
                setEditingTemplate({ ...editingTemplate, description: e.target.value })
              }
              placeholder="e.g. Formal gold and navy theme for term end examinations and holiday circulars."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              AI Generation Instructions for this Template
            </label>
            <textarea
              rows={3}
              value={editingTemplate.aiPromptInstructions || ""}
              onChange={(e) =>
                setEditingTemplate({
                  ...editingTemplate,
                  aiPromptInstructions: e.target.value,
                })
              }
              placeholder="e.g. Render with prominent alert icons, emphasize strict deadlines in amber callout cards, and include a centered download button."
              className="w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingTemplate(null);
              }}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-xs cursor-pointer"
            >
              {isPending ? "Saving..." : "Save Template"}
            </button>
          </div>
        </div>
      )}

      {/* Main Layout: Template Cards on Left, Live Mobile/PC Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template List Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Available Styles & Templates ({templates.length})
          </div>

          <div className="space-y-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate?.id === tpl.id;

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-gray-200 bg-white hover:border-gray-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/10 shadow-2xs"
                        style={{ backgroundColor: tpl.primaryColor }}
                      />
                      <span className="font-bold text-xs text-gray-900">{tpl.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                        style={{
                          backgroundColor: `${tpl.primaryColor}15`,
                          color: tpl.primaryColor,
                        }}
                      >
                        {tpl.badgeLabel}
                      </span>
                      {tpl.isBuiltIn && (
                        <span className="rounded-full bg-gray-100 text-gray-600 px-1.5 py-0.2 text-[8px] font-bold">
                          Built-in
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(tpl);
                        }}
                        className="rounded-lg bg-white border border-gray-200 hover:bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-700 shadow-2xs transition"
                      >
                        ✏️ Edit
                      </button>
                      {!tpl.isBuiltIn && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tpl.id, tpl.name);
                          }}
                          className="rounded-lg bg-white border border-rose-200 hover:bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 shadow-2xs transition"
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {onSelectTemplateForCompose && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplateForCompose(tpl);
                        }}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                      >
                        Use for Compose &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Example Preview Column (Switchable Phone & PC) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Live Example Preview: {selectedTemplate?.name || "Select a style"}
            </div>

            {/* Device Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  previewDevice === "desktop"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>💻</span>
                <span>PC View</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  previewDevice === "mobile"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>📱</span>
                <span>Phone View</span>
              </button>
            </div>
          </div>

          {selectedTemplate ? (
            <div
              className={`rounded-2xl border border-gray-300 bg-gray-100 p-4 transition-all mx-auto flex justify-center shadow-inner ${
                previewDevice === "mobile" ? "max-w-[390px]" : "w-full"
              }`}
            >
              {/* Responsive Mockup Container */}
              <div
                className={`w-full bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all ${
                  previewDevice === "mobile" ? "max-w-[360px]" : "max-w-[580px]"
                }`}
              >
                {/* Header Banner */}
                <div
                  style={{
                    backgroundColor: selectedTemplate.primaryColor,
                    padding: previewDevice === "mobile" ? "20px 16px" : "28px 24px",
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
                  <p
                    style={{
                      fontSize: previewDevice === "mobile" ? "11px" : "12px",
                      letterSpacing: "0.08em",
                    }}
                    className="font-bold uppercase tracking-wider text-white/90"
                  >
                    {collegeName}
                  </p>
                  <span
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.35)",
                    }}
                    className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xs"
                  >
                    {selectedTemplate.badgeLabel}
                  </span>
                </div>

                {/* Body Content */}
                <div
                  style={{
                    padding: previewDevice === "mobile" ? "18px 16px" : "26px 24px",
                  }}
                  className="space-y-3.5 bg-white"
                >
                  <h3
                    style={{
                      fontSize: previewDevice === "mobile" ? "17px" : "21px",
                      lineHeight: "1.3",
                    }}
                    className="font-extrabold text-gray-900 tracking-tight"
                  >
                    {selectedTemplate.sampleSubject || "Official Campus Notice & Schedule"}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedTemplate.sampleBody ||
                      "This is an example of how your plain text draft is styled by AI. The typography is balanced for crisp reading on small smartphone screens and wide computer monitors."}
                  </p>

                  {/* Sample Highlight Card */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      borderLeft: `4px solid ${selectedTemplate.primaryColor}`,
                    }}
                    className="rounded-lg p-3 space-y-1.5 text-xs text-gray-800 shadow-2xs"
                  >
                    <div className="font-bold text-[11px] uppercase tracking-wider text-gray-500">
                      📌 Key Event Information:
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📅</span>
                      <span><strong>Date:</strong> Monday, Next Week</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>⏰</span>
                      <span><strong>Reporting Time:</strong> 9:00 AM Sharp</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>📍</span>
                      <span><strong>Location:</strong> College Central Auditorium</span>
                    </div>
                  </div>

                  {/* Sample Call-to-Action Button */}
                  <div className="pt-2 text-center">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        backgroundColor: selectedTemplate.primaryColor,
                      }}
                      className="inline-block rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition"
                    >
                      View Full Details &rarr;
                    </a>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-600">
                    Office of Communications & Administration
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {collegeName} • Automated Dispatch Notification
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-xs text-gray-400">
              Select a style or template from the left to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
