"use client";

import { useState, useTransition, useActionState, useRef, useEffect } from "react";
import type {
  EmailBroadcastSettings,
  BroadcastTarget,
  BroadcastLogItem,
  EmailDispatchFeedback,
} from "@/features/communication/email-types";
import type { BatchRecord, StudentRecord } from "@/features/students/types";
import {
  sendCustomEmailAction,
  saveEmailSettingsAction,
  toggleGlobalBlockedEmailAction,
  testBrevoConnectionAction,
} from "@/features/communication/email-actions";
import RichEmailEditor from "./RichEmailEditor";
import AiEmailGenerator from "./AiEmailGenerator";
import AiEmailSettingsManager from "./AiEmailSettingsManager";
import { type EmailAiConfig, defaultEmailAiConfig } from "@/features/communication/ai-types";

interface Props {
  initialSettings: EmailBroadcastSettings;
  initialAiConfig?: EmailAiConfig;
  batches: BatchRecord[];
  students?: StudentRecord[];
  logs: BroadcastLogItem[];
  collegeName: string;
}

export default function EmailManager({
  initialSettings,
  initialAiConfig,
  batches,
  students = [],
  logs,
  collegeName,
}: Props) {
  const [activeTab, setActiveTab] = useState<"compose" | "ai_settings" | "blocked" | "settings" | "logs">("compose");
  const [settings, setSettings] = useState(initialSettings);
  const [aiConfig, setAiConfig] = useState<EmailAiConfig>(initialAiConfig || defaultEmailAiConfig);
  const [isPending, startTransition] = useTransition();

  // Send action state
  const [sendState, formAction, isSending] = useActionState<EmailDispatchFeedback, FormData>(
    sendCustomEmailAction,
    {}
  );

  const [settingsFeedback, settingsFormAction, isSavingSettings] = useActionState<
    EmailDispatchFeedback,
    FormData
  >(saveEmailSettingsAction, {});

  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sendState?.message || sendState?.error) {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [sendState]);

  // Compose form state
  const [target, setTarget] = useState<BroadcastTarget>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all_running");
  const [selectedMajor, setSelectedMajor] = useState<"all" | "science" | "business_studies" | "humanities">("all");
  const [includeAlumni, setIncludeAlumni] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [subjectText, setSubjectText] = useState("");
  const [currentHtml, setCurrentHtml] = useState("");

  // Interactive student checklist state
  const [deselectedStudentIds, setDeselectedStudentIds] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentList, setShowStudentList] = useState(true);

  // Dynamic additional email rows
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);

  // Direct file attachment state
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: number }[]>([]);

  // Blocked list state
  const [newBlockedInput, setNewBlockedInput] = useState("");
  const [blockFeedback, setBlockFeedback] = useState<string | null>(null);

  // Connection test state
  const [testResult, setTestResult] = useState<{ ok?: boolean; message?: string } | null>(null);

  // Filter students according to target, batch, major, alumni
  const filteredStudents = students.filter((s) => {
    if (s.status !== "active" && !includeAlumni) return false;

    // Batch filter
    if (selectedBatchId && selectedBatchId !== "all" && selectedBatchId !== "all_running") {
      if (s.batch_id !== selectedBatchId) return false;
    }

    // Major filter
    const effectiveMajor =
      selectedMajor !== "all"
        ? selectedMajor
        : target === "science"
        ? "science"
        : target === "business_studies"
        ? "business_studies"
        : target === "humanities"
        ? "humanities"
        : null;

    if (effectiveMajor && s.study_group !== effectiveMajor) {
      return false;
    }

    // Search filter
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const matchName = s.full_name?.toLowerCase().includes(q);
      const matchCode = s.student_code?.toLowerCase().includes(q);
      const matchRoll = String(s.roll || "").includes(q);
      const matchEmail = s.email?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchRoll && !matchEmail) return false;
    }

    return true;
  });

  const selectedStudentCount = filteredStudents.filter(
    (s) =>
      !deselectedStudentIds.has(s.id) &&
      (!s.email || !settings.global_blocked_emails.includes(s.email.toLowerCase()))
  ).length;

  const toggleStudentSelection = (id: string) => {
    setDeselectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllStudents = () => {
    setDeselectedStudentIds((prev) => {
      const next = new Set(prev);
      for (const s of filteredStudents) {
        next.delete(s.id);
      }
      return next;
    });
  };

  const handleDeselectAllStudents = () => {
    setDeselectedStudentIds((prev) => {
      const next = new Set(prev);
      for (const s of filteredStudents) {
        next.add(s.id);
      }
      return next;
    });
  };

  // Add / remove dynamic additional email rows
  const handleAddEmailRow = () => {
    setAdditionalEmails((prev) => [...prev, ""]);
  };

  const handleUpdateEmailRow = (idx: number, val: string) => {
    setAdditionalEmails((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleRemoveEmailRow = (idx: number) => {
    setAdditionalEmails((prev) => prev.filter((_, i) => i !== idx));
  };

  // Direct file attachment selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const list = Array.from(e.target.files).map((f) => ({ name: f.name, size: f.size }));
      setSelectedFiles(list);
    }
  };

  // Toggle master system ON/OFF
  const handleToggleSystem = (enabled: boolean) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("enabled", String(enabled));
      fd.set("sender_name", settings.sender_name);
      fd.set("sender_email", settings.sender_email);
      fd.set("auto_send_on_notice", String(settings.auto_send_on_notice));
      fd.set("auto_send_on_news", String(settings.auto_send_on_news ?? true));

      const res = await saveEmailSettingsAction({}, fd);
      if (res.success) {
        setSettings((prev) => ({ ...prev, enabled }));
      }
    });
  };

  // Permanent block list handler
  const handleAddBlockedRecipient = async () => {
    const trimmed = newBlockedInput.trim();
    if (!trimmed) return;
    setBlockFeedback("Saving...");
    const res = await toggleGlobalBlockedEmailAction(trimmed, "block");
    if (res.success) {
      setSettings((prev) => ({
        ...prev,
        global_blocked_emails: [...prev.global_blocked_emails, trimmed.toLowerCase()],
      }));
      setNewBlockedInput("");
      setBlockFeedback(`Saved: "${trimmed}" is permanently blocked from emails.`);
    } else {
      setBlockFeedback(res.error || "Failed to block.");
    }
  };

  const handleRemoveBlockedRecipient = async (emailOrId: string) => {
    setBlockFeedback("Removing...");
    const res = await toggleGlobalBlockedEmailAction(emailOrId, "unblock");
    if (res.success) {
      setSettings((prev) => ({
        ...prev,
        global_blocked_emails: prev.global_blocked_emails.filter(
          (item) => item.toLowerCase() !== emailOrId.toLowerCase()
        ),
      }));
      setBlockFeedback(`Unblocked: "${emailOrId}".`);
    } else {
      setBlockFeedback(res.error || "Failed to unblock.");
    }
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    startTransition(async () => {
      const res = await testBrevoConnectionAction();
      setTestResult({ ok: res.success, message: res.message || res.error });
    });
  };

  const shouldShowStudentsList =
    target === "students" ||
    target === "batch" ||
    target === "science" ||
    target === "business_studies" ||
    target === "humanities" ||
    target === "all";

  return (
    <div className="space-y-6">
      {/* Header with Master System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📧</span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Campus Email Broadcast Center
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                settings.enabled
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {settings.enabled ? "● System Active (ON)" : "○ System Paused (OFF)"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Send rich emails, target specific batches or majors (Science / Business / Humanities), deselect individual students, attach local files without saving to database, and track Brevo deliveries.
          </p>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-gray-700">Master Switch:</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleToggleSystem(!settings.enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.enabled ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: "compose", label: "✉️ Compose & Broadcast", count: null },
            {
              id: "ai_settings",
              label: "🤖 AI Assistant & Keys",
              count:
                aiConfig.provider === "google"
                  ? `${aiConfig.googleKeys.filter((k) => k.isActive).length} Keys`
                  : "Custom AI",
            },
            { id: "blocked", label: "🚫 Saved Blocked Recipients", count: settings.global_blocked_emails.length },
            { id: "settings", label: "⚙️ Sender & Brevo Config", count: null },
            { id: "logs", label: "📋 Delivery Logs", count: logs.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: COMPOSE & BROADCAST */}
      {activeTab === "compose" && (
        <form action={formAction} className="space-y-6">
          {/* Hidden inputs for deselected student IDs */}
          {Array.from(deselectedStudentIds).map((id) => (
            <input key={id} type="hidden" name="excluded_student_ids" value={id} />
          ))}

          {/* Section 1: Audience & Targeting */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-gray-900">1. Select Recipient Audience</h2>
              <p className="text-xs text-gray-500">
                Choose who should receive this email broadcast. You can target specific majors, batches, or uncheck individual students below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Target Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Recipient Group
                </label>
                <select
                  name="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as BroadcastTarget)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">🌐 Entire Campus (Running Students & Teachers)</option>
                  <option value="students">🎓 All Students</option>
                  <option value="science">🔬 Science Students Only</option>
                  <option value="business_studies">💼 Business Studies Students Only</option>
                  <option value="humanities">🎨 Humanities Students Only</option>
                  <option value="teachers">👨‍🏫 Teachers & Staff Only</option>
                  <option value="batch">👥 Specific Batch</option>
                  <option value="individual">👤 Single Individual Recipient</option>
                </select>
              </div>

              {/* Major Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Major / Study Group
                </label>
                <select
                  name="study_group"
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Majors (Science, Business, Humanities)</option>
                  <option value="science">🔬 Science</option>
                  <option value="business_studies">💼 Business Studies (Commerce)</option>
                  <option value="humanities">🎨 Humanities (Arts)</option>
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Academic Batch / Year
                </label>
                <select
                  name="batch_id"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all_running">All Running Batches (Batch 26 & Batch 27)</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.status === "running" ? "Running" : "Passed Out"})
                    </option>
                  ))}
                  <option value="all">All Batches (Including Alumni)</option>
                </select>
              </div>
            </div>

            {/* Individual email if chosen */}
            {target === "individual" && (
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  name="individual_email"
                  required={target === "individual"}
                  placeholder="recipient@example.com"
                  className="w-full sm:w-1/2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Include Alumni checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="include_alumni"
                  checked={includeAlumni}
                  onChange={(e) => setIncludeAlumni(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Include Passed-Out / Alumni Batches (Students who have already graduated)</span>
              </label>
            </div>

            {/* Interactive Student Checklist & Individual Deselection */}
            {shouldShowStudentsList && students.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-blue-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-950">
                        👥 Eligible Students in this Selection:
                      </span>
                      <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                        {selectedStudentCount} selected / {filteredStudents.length} total
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Uncheck any student below to exclude them from receiving this email broadcast.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="rounded bg-white border border-blue-300 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllStudents}
                      className="rounded bg-white border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStudentList(!showStudentList)}
                      className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200"
                    >
                      {showStudentList ? "Hide List ▲" : "Show List ▼"}
                    </button>
                  </div>
                </div>

                {showStudentList && (
                  <div className="space-y-3">
                    {/* Search box within student list */}
                    <div className="max-w-md">
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search student by name, roll, or ID code..."
                        className="w-full rounded border border-blue-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Scrollable Checkbox Grid */}
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-blue-200 bg-white p-3 space-y-1">
                      {filteredStudents.length === 0 ? (
                        <p className="text-xs text-gray-500 py-2 text-center">
                          No students match the current batch/major filters.
                        </p>
                      ) : (
                        filteredStudents.map((s) => {
                          const isDeselected = deselectedStudentIds.has(s.id);
                          const isGloballyBlocked = settings.global_blocked_emails.includes(
                            s.email?.toLowerCase() || ""
                          );

                          return (
                            <label
                              key={s.id}
                              className={`flex items-center justify-between p-1.5 rounded transition cursor-pointer text-xs ${
                                isGloballyBlocked
                                  ? "bg-red-50 text-red-700 cursor-not-allowed"
                                  : isDeselected
                                  ? "bg-gray-50 text-gray-400 line-through"
                                  : "hover:bg-blue-50/70 text-gray-800"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  disabled={isGloballyBlocked}
                                  checked={!isDeselected && !isGloballyBlocked}
                                  onChange={() => toggleStudentSelection(s.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div>
                                  <span className="font-semibold text-gray-900">{s.full_name}</span>{" "}
                                  <span className="text-[11px] text-gray-500 font-mono">
                                    ({s.student_code} • Roll: {s.roll})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-gray-100 text-gray-600">
                                  {s.study_group}
                                </span>
                                <span className="text-[11px] text-gray-500 hidden sm:inline">
                                  {s.email}
                                </span>
                                {isGloballyBlocked && (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                    Permanently Blocked
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Additional Custom Emails (Dynamic Box List) */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">2. Additional Recipient Emails</h2>
                <p className="text-xs text-gray-500">
                  Click "+ Add Additional Email" to append extra recipient mailboxes one by one.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEmailRow}
                className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
              >
                + Add Additional Email
              </button>
            </div>

            {additionalEmails.length === 0 ? (
              <div className="text-xs text-gray-500 italic py-2">
                No extra email addresses added. Click "+ Add Additional Email" above if you want to include extra people.
              </div>
            ) : (
              <div className="space-y-2">
                {additionalEmails.map((emailVal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="email"
                      name="additional_emails"
                      value={emailVal}
                      onChange={(e) => handleUpdateEmailRow(idx, e.target.value)}
                      placeholder="e.g. guest.scholar@gmail.com"
                      className="w-full sm:w-80 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailRow(idx)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove this email"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Subject & Email Content */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">3. Compose Email Content</h2>
                <p className="text-xs text-gray-500">
                  Write your subject, format with headings, colors, lists, action buttons, and attach local files.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                {showPreview ? "Hide Preview" : "👁️ Live Inbox Preview"}
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Subject Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                placeholder="e.g. Urgent Update: Pre-Board Examination Schedule Announced"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* AI Email Formatter & Generator */}
            {aiConfig.enabled && (
              <AiEmailGenerator
                currentSubject={subjectText}
                onApplyHtml={(generatedHtml) => {
                  setCurrentHtml(generatedHtml);
                  setShowPreview(true);
                }}
                onOpenSettings={() => setActiveTab("ai_settings")}
              />
            )}

            {/* Rich Editor */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Email Message Body
              </label>
              <RichEmailEditor
                name="html_content"
                initialContent={currentHtml}
                onChange={(html) => setCurrentHtml(html)}
              />
            </div>

            {/* Direct File Uploads (Zero DB Storage) */}
            <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 space-y-2">
              <div>
                <label className="block text-xs font-bold text-gray-900">
                  📎 Direct File Attachments (Local Upload)
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select one or more files from your computer (PDFs, images, Word, Excel). These files are delivered directly via Brevo and <strong>never saved in the database</strong>.
                </p>
              </div>

              <input
                type="file"
                name="attachment_files"
                multiple
                onChange={handleFileChange}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedFiles.map((file, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-900 font-medium shadow-2xs"
                    >
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Live Preview Modal / Card */}
            {showPreview && (
              <div className="rounded-xl border border-blue-200 bg-gray-50 p-5 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                    Inbox Preview: {collegeName}
                  </h3>
                  <span className="text-[11px] text-gray-500">Subject: {subjectText || "(No subject yet)"}</span>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 max-w-xl mx-auto">
                  <div className="border-b pb-3 mb-4">
                    <p className="text-xs text-gray-400">From: {settings.sender_name} &lt;{settings.sender_email}&gt;</p>
                    <p className="text-xs text-gray-400">To: {target} recipients</p>
                    <h2 className="text-base font-bold text-gray-900 mt-1">{subjectText || "Your Subject Line"}</h2>
                  </div>
                  <div
                    className="email-editor-body text-sm text-gray-800 space-y-2"
                    dangerouslySetInnerHTML={{ __html: currentHtml || "<p>Your email message...</p>" }}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 pt-3 border-t text-xs text-gray-600">
                      <strong>Attachments ({selectedFiles.length}):</strong>{" "}
                      {selectedFiles.map((f) => f.name).join(", ")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Success / Error Feedback Alert Placed Right Near Send Button */}
          <div ref={feedbackRef} className="space-y-3">
            {sendState?.message && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 shadow-sm flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <h4 className="font-bold">Broadcast Dispatched Successfully!</h4>
                  <p className="text-xs mt-0.5">{sendState.message}</p>
                </div>
              </div>
            )}

            {sendState?.error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 shadow-sm flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-bold">Failed to Send Email</h4>
                  <p className="text-xs mt-0.5">{sendState.error}</p>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <div className="text-xs text-gray-500">
                <span>Sending to </span>
                <strong className="text-gray-900 font-bold">
                  {target === "individual"
                    ? "1 Recipient"
                    : `${selectedStudentCount + additionalEmails.filter((e) => e.trim().length > 0).length} Total Recipient(s)`}
                </strong>
                <span> via Brevo API.</span>
              </div>

              <button
                type="submit"
                disabled={isSending || !settings.enabled}
                className={`rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow transition flex items-center justify-center gap-2 ${
                  !settings.enabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : isSending
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSending ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Broadcasting via Brevo...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Send Broadcast Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PERMANENTLY SAVED BLOCKED RECIPIENTS */}
      {activeTab === "blocked" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">
              Permanently Saved Blocked Recipients ({settings.global_blocked_emails.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Emails or Student IDs saved here are permanently excluded from all automated and custom email broadcasts. You never have to re-type them!
            </p>
          </div>

          {blockFeedback && (
            <div className="rounded border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-800">
              {blockFeedback}
            </div>
          )}

          {/* Add to blocklist form */}
          <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              type="text"
              value={newBlockedInput}
              onChange={(e) => setNewBlockedInput(e.target.value)}
              placeholder="Enter email (e.g. student@gmail.com) or Student ID (e.g. STU-2027-3001)..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddBlockedRecipient}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shrink-0"
            >
              + Permanently Block Recipient
            </button>
          </div>

          {/* Blocked table */}
          {settings.global_blocked_emails.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500">
              No recipients are permanently blocked. Everyone who is active will receive emails.
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
                  <tr>
                    <th className="px-4 py-2.5">Blocked Email or Student ID</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800">
                  {settings.global_blocked_emails.map((item) => (
                    <tr key={item} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-mono font-medium text-red-700">
                        🚫 {item}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedRecipient(item)}
                          className="rounded border border-gray-300 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition"
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: AI ASSISTANT CONFIG */}
      {activeTab === "ai_settings" && (
        <AiEmailSettingsManager
          initialConfig={aiConfig}
          onSaved={(newCfg) => setAiConfig(newCfg)}
        />
      )}

      {/* TAB 3: SETTINGS & SENDER CONFIG */}
      {activeTab === "settings" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-6 max-w-3xl">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">Email System Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Control your Brevo sender details, automated mailer toggles, and verify API connectivity.
            </p>
          </div>

          <form action={settingsFormAction} className="space-y-4">
            {settingsFeedback?.message && (
              <div className="rounded border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                ✅ {settingsFeedback.message}
              </div>
            )}
            {settingsFeedback?.error && (
              <div className="rounded border border-red-300 bg-red-50 p-2.5 text-xs text-red-800">
                ⚠️ {settingsFeedback.error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                name="sender_name"
                defaultValue={settings.sender_name}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Sender Email Address
              </label>
              <input
                type="email"
                name="sender_email"
                defaultValue={settings.sender_email}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Must be an authenticated sender email in your Brevo account.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                <input
                  type="checkbox"
                  name="auto_send_on_notice"
                  defaultChecked={settings.auto_send_on_notice}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Automatically send email broadcast when publishing a Notice</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                <input
                  type="checkbox"
                  name="auto_send_on_news"
                  defaultChecked={settings.auto_send_on_news ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Automatically send email broadcast when publishing News & Events</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={settings.enabled}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Email Sending Master Switch Enabled</span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Save Settings
              </button>
            </div>
          </form>

          {/* Test connection */}
          <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-purple-950">Test Brevo API Connection</h3>
              <p className="text-xs text-purple-700 mt-0.5">
                Verify if your configured API key can authenticate with Brevo.
              </p>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handleTestConnection}
              className="rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
            >
              {isPending ? "Testing..." : "Test Brevo Connection"}
            </button>

            {testResult && (
              <div
                className={`rounded p-2.5 text-xs font-medium ${
                  testResult.ok
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-red-100 text-red-900 border border-red-300"
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY LOGS */}
      {activeTab === "logs" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">Broadcast Delivery History ({logs.length})</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Past emails dispatched through the college system.
            </p>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500">
              No email broadcasts recorded yet.
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
                  <tr>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Target Audience</th>
                    <th className="px-4 py-2.5 text-center">Recipients</th>
                    <th className="px-4 py-2.5 text-center">Blocked Excluded</th>
                    <th className="px-4 py-2.5 text-right">Sent Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-semibold text-gray-900">{log.subject}</td>
                      <td className="px-4 py-2.5 text-gray-600">{log.target_summary}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-blue-700">
                        {log.recipient_count}
                      </td>
                      <td className="px-4 py-2.5 text-center text-red-600 font-semibold">
                        {log.blocked_count}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-500">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
