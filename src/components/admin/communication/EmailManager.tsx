"use client";

import { useState, useTransition, useActionState } from "react";
import type {
  EmailBroadcastSettings,
  BroadcastTarget,
  BroadcastLogItem,
  EmailDispatchFeedback,
} from "@/features/communication/email-types";
import type { BatchRecord } from "@/features/students/types";
import {
  sendCustomEmailAction,
  saveEmailSettingsAction,
  toggleGlobalBlockedEmailAction,
  testBrevoConnectionAction,
} from "@/features/communication/email-actions";
import RichEmailEditor from "./RichEmailEditor";

interface Props {
  initialSettings: EmailBroadcastSettings;
  batches: BatchRecord[];
  logs: BroadcastLogItem[];
  collegeName: string;
}

export default function EmailManager({
  initialSettings,
  batches,
  logs,
  collegeName,
}: Props) {
  const [activeTab, setActiveTab] = useState<"compose" | "blocked" | "settings" | "logs">("compose");
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  // Send action state
  const [sendState, formAction, isSending] = useActionState<EmailDispatchFeedback, FormData>(
    sendCustomEmailAction,
    {}
  );

  // Compose form state
  const [target, setTarget] = useState<BroadcastTarget>("all");
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || "");
  const [includeAlumni, setIncludeAlumni] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [subjectText, setSubjectText] = useState("");
  const [currentHtml, setCurrentHtml] = useState("");

  // Blocked list state
  const [newBlockedInput, setNewBlockedInput] = useState("");
  const [blockFeedback, setBlockFeedback] = useState<string | null>(null);

  // Connection test state
  const [testResult, setTestResult] = useState<{ ok?: boolean; message?: string } | null>(null);

  // Toggle master system ON/OFF
  const handleToggleSystem = (enabled: boolean) => {
    startTransition(async () => {
      const res = await saveEmailSettingsAction({ enabled });
      if (res.success) {
        setSettings((prev) => ({ ...prev, enabled }));
      }
    });
  };

  const handleToggleAutoNotice = (auto_send_on_notice: boolean) => {
    startTransition(async () => {
      const res = await saveEmailSettingsAction({ auto_send_on_notice });
      if (res.success) {
        setSettings((prev) => ({ ...prev, auto_send_on_notice }));
      }
    });
  };

  const handleTestConnection = () => {
    startTransition(async () => {
      setTestResult(null);
      const res = await testBrevoConnectionAction();
      if (res.ok) {
        setTestResult({ ok: true, message: `Connected to Brevo successfully! Account: ${res.email}` });
      } else {
        setTestResult({ ok: false, message: res.error || "Connection failed" });
      }
    });
  };

  const handleAddBlocked = () => {
    if (!newBlockedInput.trim()) return;
    startTransition(async () => {
      setBlockFeedback(null);
      const res = await toggleGlobalBlockedEmailAction(newBlockedInput.trim(), "block");
      if (res.success) {
        setSettings((prev) => ({
          ...prev,
          global_blocked_emails: [...prev.global_blocked_emails, newBlockedInput.trim().toLowerCase()],
        }));
        setNewBlockedInput("");
        setBlockFeedback("Recipient added to blocklist.");
      } else {
        setBlockFeedback(res.error || "Failed to block.");
      }
    });
  };

  const handleRemoveBlocked = (item: string) => {
    startTransition(async () => {
      const res = await toggleGlobalBlockedEmailAction(item, "unblock");
      if (res.success) {
        setSettings((prev) => ({
          ...prev,
          global_blocked_emails: prev.global_blocked_emails.filter((x) => x !== item),
        }));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Master System Toggle & Status */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📬</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Brevo Email Notification Engine</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Send campus announcements, custom messages, and notices via Brevo REST API.
              </p>
            </div>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div className="text-right">
            <div className="text-xs font-bold text-gray-900">Email System</div>
            <div className={`text-[11px] font-extrabold uppercase ${settings.enabled ? "text-emerald-700" : "text-gray-500"}`}>
              {settings.enabled ? "● System Active (ON)" : "○ System Paused (OFF)"}
            </div>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleToggleSystem(!settings.enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.enabled ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {!settings.enabled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2">
          <span className="text-base">⚠️</span>
          <p>
            <strong>The email sending system is currently paused.</strong> Notices published on the website will not trigger email broadcasts until you re-enable the system above.
          </p>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("compose")}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === "compose"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          ✍️ Compose &amp; Broadcast
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("blocked")}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === "blocked"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          🚫 Blocked Recipients ({settings.global_blocked_emails.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === "settings"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          ⚙️ Settings &amp; Brevo API
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`pb-3 px-4 border-b-2 transition ${
            activeTab === "logs"
              ? "border-blue-700 text-blue-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          📜 Delivery History ({logs.length})
        </button>
      </div>

      {/* TAB 1: COMPOSE & BROADCAST */}
      {activeTab === "compose" && (
        <form action={formAction} className="space-y-6">
          {/* Feedback Alerts */}
          {sendState.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-2">
              <span className="text-base">❌</span>
              <p>{sendState.error}</p>
            </div>
          )}
          {sendState.success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-2">
              <span className="text-base">✅</span>
              <p>{sendState.message}</p>
            </div>
          )}

          {/* Section 1: Target Audience Selection */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
              1. Select Target Audience
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-bold text-gray-800">Target Group</label>
                <select
                  name="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as BroadcastTarget)}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">👥 All Active Students &amp; Teachers (Campus-Wide)</option>
                  <option value="students">🎓 Students Only (All Enrolled)</option>
                  <option value="teachers">👩‍🏫 Teachers &amp; Staff Only</option>
                  <option value="batch">📚 Specific Batch (e.g. HSC 26 or 27)</option>
                  <option value="individual">👤 Individual Person (One-to-One)</option>
                  <option value="custom">📋 Custom Email List Only</option>
                </select>
              </div>

              {/* Specific Batch Dropdown */}
              {target === "batch" && (
                <div>
                  <label className="block text-xs font-bold text-gray-800">Select Batch</label>
                  <select
                    name="batch_id"
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.exam_year})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Individual Recipient Input */}
              {target === "individual" && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-800">
                    Recipient Email Address
                  </label>
                  <input
                    name="individual_email"
                    type="email"
                    placeholder="e.g. student@gmail.com"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Alumni Checkbox for Batch */}
              {(target === "batch" || target === "students") && (
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="include_alumni"
                    name="include_alumni"
                    checked={includeAlumni}
                    onChange={(e) => setIncludeAlumni(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="include_alumni" className="text-xs font-semibold text-gray-700">
                    Include Alumni / Passed-Out Students
                  </label>
                </div>
              )}
            </div>

            {/* Custom Extra Emails & Per-Broadcast Blocklist */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-800">
                  + Additional Custom Email Addresses (Optional)
                </label>
                <input
                  name="additional_emails"
                  type="text"
                  placeholder="Comma-separated: guardian@gmail.com, board@gov.bd"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  These emails will receive the broadcast in addition to the selected group.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-red-800">
                  🚫 Block / Exclude Specific Recipients From This Broadcast
                </label>
                <input
                  name="excluded_emails"
                  type="text"
                  placeholder="e.g. STU-2027-3001, student@example.com"
                  className="mt-1 w-full rounded-md border border-red-200 bg-red-50/40 px-3 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Anyone matching these Student IDs or email addresses will be skipped and receive NO email.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Email Content & Rich Formatting */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                2. Compose Rich Email Message
              </h3>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                {showPreview ? "Hide Live Preview" : "👁️ Live Inbox Preview"}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800">
                Email Subject Line <span className="text-red-500">*</span>
              </label>
              <input
                name="subject"
                type="text"
                required
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                placeholder="e.g. Urgent Notice: HSC 1st Year Pre-Board Examination Schedule"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Rich Editor */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Email Body (Rich Text Formatting, Links, Headers, Lists &amp; HTML)
              </label>
              <RichEmailEditor
                onChange={(html) => setCurrentHtml(html)}
              />
            </div>

            {/* Attachments */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-gray-800">
                  Attachment Document URL (Optional)
                </label>
                <input
                  name="attachment_url"
                  type="text"
                  placeholder="e.g. /documents/routine.pdf or https://..."
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800">
                  Attachment File Display Name
                </label>
                <input
                  name="attachment_name"
                  type="text"
                  placeholder="e.g. HSC-Exam-Routine-2026.pdf"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Email Preview Frame */}
            {showPreview && (
              <div className="mt-4 rounded-xl border-2 border-blue-200 bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>📬 Live Inbox Preview (How recipients see it):</span>
                  <span className="font-mono text-gray-500">From: {settings.sender_name} &lt;{settings.sender_email}&gt;</span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-md max-w-xl mx-auto overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white text-center">
                    <h4 className="text-base font-black uppercase tracking-tight">{collegeName}</h4>
                    <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5">Official Campus Communication</p>
                  </div>
                  <div className="p-6 text-gray-800 text-sm">
                    {subjectText && <h3 className="text-lg font-bold text-gray-900 mb-3">{subjectText}</h3>}
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: currentHtml || "<p>Email message body...</p>" }}
                    />
                  </div>
                  <div className="bg-gray-50 p-4 text-center border-t border-gray-100 text-[11px] text-gray-500">
                    <p className="font-semibold">{collegeName}</p>
                    <p className="mt-0.5">Official Administrative Notice • Delivered via Brevo</p>
                  </div>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="pt-4 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Brevo Sender: <code className="font-mono">{settings.sender_email}</code>
              </span>

              <button
                type="submit"
                disabled={isSending || !settings.enabled}
                className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-2.5 text-sm font-bold text-white shadow hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 transition"
              >
                {isSending ? "🚀 Dispatching via Brevo…" : "🚀 Send Email Broadcast Now"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: BLOCKED / BLACKLISTED RECIPIENTS */}
      {activeTab === "blocked" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Permanent Email Blocklist / Suppression</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add specific email addresses or Student IDs here. Anyone listed here will be <strong>automatically excluded</strong> from all campus announcements and broadcasts.
            </p>
          </div>

          {blockFeedback && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
              {blockFeedback}
            </div>
          )}

          {/* Add to blocklist input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <input
              type="text"
              value={newBlockedInput}
              onChange={(e) => setNewBlockedInput(e.target.value)}
              placeholder="Enter Student ID (e.g. STU-2027-3001) or Email"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-red-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={isPending || !newBlockedInput.trim()}
              onClick={handleAddBlocked}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
            >
              + Block Recipient
            </button>
          </div>

          {/* Blocked list table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Blocked Identifier / Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {settings.global_blocked_emails.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">
                      No recipients are currently blocked. Everyone will receive broadcasts according to audience settings.
                    </td>
                  </tr>
                ) : (
                  settings.global_blocked_emails.map((item) => (
                    <tr key={item} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{item}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          Suppressed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveBlocked(item)}
                          className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 text-red-600 hover:border-red-300"
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & BREVO API */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-gray-900">Email System Configuration</h3>
            <p className="text-xs text-gray-500 mt-1">
              Configure your Brevo sender identity, automated notice triggers, and test credentials.
            </p>
          </div>

          <div className="space-y-4">
            {/* Auto Notice Broadcast Toggle */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <label className="text-xs font-bold text-gray-900 block">
                  Automatically Email on Notice Publication
                </label>
                <p className="text-[11px] text-gray-500">
                  When enabled, whenever an administrator publishes a notice, an email is dispatched to active students and teachers.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_send_on_notice}
                onChange={(e) => handleToggleAutoNotice(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-xs font-bold text-gray-800">Sender Display Name</label>
              <input
                type="text"
                defaultValue={settings.sender_name}
                onBlur={(e) => saveEmailSettingsAction({ sender_name: e.target.value.trim() })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">The name shown in recipient inboxes.</p>
            </div>

            {/* Sender Email */}
            <div>
              <label className="block text-xs font-bold text-gray-800">Sender Email Address</label>
              <input
                type="email"
                defaultValue={settings.sender_email}
                onBlur={(e) => saveEmailSettingsAction({ sender_email: e.target.value.trim() })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Must be an authorized or verified sender in your Brevo account dashboard.
              </p>
            </div>

            {/* Brevo Connection Test */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-900">Brevo API Connection Status</div>
                  <div className="text-[11px] text-gray-500">
                    Verify connectivity with your Brevo API key.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleTestConnection}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  {isPending ? "Testing…" : "⚡ Test Connection"}
                </button>
              </div>

              {testResult && (
                <div
                  className={`mt-3 rounded-lg border p-3 text-xs ${
                    testResult.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY HISTORY & LOGS */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Recent Broadcast Logs</h3>
              <p className="text-xs text-gray-500 mt-1">
                Records of automated and custom email dispatches via Brevo.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Audience Target</th>
                  <th className="px-4 py-3">Recipients</th>
                  <th className="px-4 py-3">Suppressed</th>
                  <th className="px-4 py-3">Sent Timestamp</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No email broadcasts logged yet. Sent emails will appear here.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-900">{log.subject}</td>
                      <td className="px-4 py-3 text-gray-600">{log.target_summary}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {log.recipient_count}
                      </td>
                      <td className="px-4 py-3 font-mono text-red-600">
                        {log.blocked_count > 0 ? `${log.blocked_count} blocked` : "0"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(log.sent_at).toLocaleString("en-GB")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                          Delivered
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
