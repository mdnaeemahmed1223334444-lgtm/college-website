"use client";

import { useState, useTransition } from "react";
import type {
  EmailAiConfig,
  GoogleAiKeyItem,
  AiProvider,
} from "@/features/communication/ai-types";
import {
  saveEmailAiConfigAction,
  testAiConfigAction,
} from "@/features/communication/ai-actions";

interface Props {
  initialConfig: EmailAiConfig;
  onSaved?: (newConfig: EmailAiConfig) => void;
}

export default function AiEmailSettingsManager({
  initialConfig,
  onSaved,
}: Props) {
  const sanitizeConfig = (cfg: EmailAiConfig): EmailAiConfig => {
    let googleModel = cfg.googleModel;
    if (
      !googleModel ||
      googleModel.includes("gemini-2.0") ||
      googleModel.includes("gemini-1.5") ||
      googleModel === "gemini-pro"
    ) {
      googleModel = "gemini-3.8-flash";
    }
    return {
      ...cfg,
      googleModel,
    };
  };

  const [config, setConfig] = useState<EmailAiConfig>(() => sanitizeConfig(initialConfig));
  const [isPending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    latencyMs?: number;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // New key form input
  const [newKeyInput, setNewKeyInput] = useState("");
  const [newKeyName, setNewKeyName] = useState("");

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddKey = () => {
    const trimmed = newKeyInput.trim();
    if (!trimmed) {
      showToast("error", "Please enter a valid Google AI Studio API key.");
      return;
    }

    const newItem: GoogleAiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim() || `API Key ${config.googleKeys.length + 1}`,
      apiKey: trimmed,
      isActive: true,
      addedAt: new Date().toISOString(),
    };

    const updated = {
      ...config,
      googleKeys: [...config.googleKeys, newItem],
    };

    setConfig(updated);
    setNewKeyInput("");
    setNewKeyName("");
    showToast("success", "API key added to list. Click 'Save Settings' to commit.");
  };

  const handleToggleKey = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      googleKeys: prev.googleKeys.map((k) =>
        k.id === id ? { ...k, isActive: !k.isActive } : k
      ),
    }));
  };

  const handleRemoveKey = (id: string) => {
    if (!confirm("Are you sure you want to remove this API key?")) return;
    setConfig((prev) => ({
      ...prev,
      googleKeys: prev.googleKeys.filter((k) => k.id !== id),
    }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConfigAction(config);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach AI service",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveEmailAiConfigAction(config);
      if (res.success) {
        showToast("success", "AI configuration saved successfully!");
        onSaved?.(config);
      } else {
        showToast("error", res.error || "Failed to save AI configuration.");
      }
    });
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 10) return "••••••••••";
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toast Alert */}
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
      <div className="border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h2 className="text-base font-bold text-gray-900">
            AI Email Formatter Configuration
          </h2>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure Google AI Studio (Gemini Free API) or custom AI endpoints to
          transform raw text drafts into stunning responsive HTML emails.
        </p>
      </div>

      {/* Master Toggle */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-gray-900">Enable AI Email Assistant</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Displays the "✨ Format & Beautify with AI" generator in the email compose panel.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* AI Provider Switch */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          Select AI Provider
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfig({ ...config, provider: "google" })}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              config.provider === "google"
                ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500 ring-inset"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <span>⚡</span>
                <span>Google AI Studio (Gemini)</span>
              </div>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 uppercase">
                Free API Key
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Official Google Gemini API with multiple key rotation. Free tier offers generous usage.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setConfig({ ...config, provider: "custom" })}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              config.provider === "custom"
                ? "border-purple-600 bg-purple-50/60 ring-2 ring-purple-500 ring-inset"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <span>🌐</span>
                <span>Custom AI Provider</span>
              </div>
              <span className="rounded bg-purple-100 text-purple-800 text-[10px] font-black px-1.5 py-0.5 uppercase">
                OpenAI Compatible
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use any OpenAI-compatible API (OpenRouter, Groq, DeepSeek, Local Ollama, etc.) with custom Base URL.
            </p>
          </button>
        </div>
      </div>

      {/* PROVIDER 1: GOOGLE AI STUDIO (GEMINI) */}
      {config.provider === "google" && (
        <div className="rounded-2xl border border-blue-200 bg-white p-5 space-y-5 shadow-xs">
          {/* Guide Banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <span className="text-lg shrink-0">💡</span>
            <div className="leading-relaxed">
              <p className="font-bold">How to get a Free Google AI Studio API key:</p>
              <p className="text-blue-800 mt-0.5">
                Visit{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline hover:text-blue-950"
                >
                  aistudio.google.com/app/apikey ↗
                </a>
                , sign in with your Google account, click <strong>"Create API Key"</strong>, and paste it below. You can add multiple keys; if one key reaches rate limits, the system automatically falls back to the next key!
              </p>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-800">
                Google Gemini Model
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                ✨ Gemini 3.8 Series Active
              </span>
            </div>
            <select
              value={
                ["gemini-3.8-flash", "gemini-3.8-pro", "gemini-3.8-flash-lite"].includes(config.googleModel)
                  ? config.googleModel
                  : "custom"
              }
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setConfig({ ...config, googleModel: e.target.value });
                } else {
                  setConfig({ ...config, googleModel: "" });
                }
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="gemini-3.8-flash">
                gemini-3.8-flash (Latest — Fastest & Best Quality — Recommended)
              </option>
              <option value="gemini-3.8-pro">
                gemini-3.8-pro (High Reasoning Complexity)
              </option>
              <option value="gemini-3.8-flash-lite">
                gemini-3.8-flash-lite (Ultra Fast Lightweight)
              </option>
              <option value="custom">
                Custom Gemini Model Name (Type below...)
              </option>
            </select>

            {!["gemini-3.8-flash", "gemini-3.8-pro", "gemini-3.8-flash-lite"].includes(config.googleModel) && (
              <div className="mt-1.5">
                <input
                  type="text"
                  placeholder="Enter custom Gemini model name (e.g. gemini-3.8-flash)"
                  value={config.googleModel}
                  onChange={(e) => setConfig({ ...config, googleModel: e.target.value })}
                  className="w-full rounded-xl border border-blue-400 bg-blue-50/30 px-3 py-2 text-xs font-mono text-gray-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Add New Key Form */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-900">Add New Google AI Studio API Key</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="Key Label (e.g. Primary, Backup)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <input
                  type="password"
                  placeholder="Paste AIzaSy... API key"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddKey}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition shrink-0 cursor-pointer"
                >
                  ➕ Add Key
                </button>
              </div>
            </div>
          </div>

          {/* Key List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Configured API Keys ({config.googleKeys.length})</span>
              <span className="text-[11px] text-gray-500 font-normal">
                {config.googleKeys.filter((k) => k.isActive).length} active for automatic rotation
              </span>
            </div>

            {config.googleKeys.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500 bg-gray-50">
                No Google AI API keys configured yet. Paste your key above to enable AI email generation.
              </div>
            ) : (
              <div className="space-y-2">
                {config.googleKeys.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-xs hover:border-gray-300 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">🔑</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {item.name || `Key #${idx + 1}`}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[9px] font-black uppercase ${
                              item.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <code className="text-[11px] font-mono text-gray-500 block truncate">
                          {maskKey(item.apiKey)}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleKey(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          item.isActive
                            ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        {item.isActive ? "Pause" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveKey(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Remove Key"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROVIDER 2: CUSTOM AI (OPENAI COMPATIBLE) */}
      {config.provider === "custom" && (
        <div className="rounded-2xl border border-purple-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold text-gray-900">Custom AI Endpoint Settings</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Connect to any OpenAI-compatible provider (e.g. OpenRouter, Groq, DeepSeek, Together.ai, or local proxy).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={config.customBaseUrl}
              onChange={(e) => setConfig({ ...config, customBaseUrl: e.target.value })}
              placeholder="e.g. https://api.openai.com/v1 or https://openrouter.ai/api/v1"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Endpoint will automatically append /chat/completions if not present.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Custom API Key
            </label>
            <input
              type="password"
              value={config.customApiKey}
              onChange={(e) => setConfig({ ...config, customApiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Model Name
            </label>
            <input
              type="text"
              value={config.customModel}
              onChange={(e) => setConfig({ ...config, customModel: e.target.value })}
              placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile, deepseek-chat"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs font-mono text-gray-900 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Test Result Feedback */}
      {testResult && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium ${
            testResult.success
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <span>{testResult.success ? "✅ Connection Verified" : "⚠️ Test Failed"}</span>
            {testResult.latencyMs && (
              <span className="text-[10px] font-mono opacity-70">
                ({testResult.latencyMs}ms)
              </span>
            )}
          </div>
          <p className="mt-1 text-xs opacity-90">{testResult.message}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <span className="animate-spin">⏳</span> Testing Connection…
            </>
          ) : (
            <>
              <span>🧪</span> Test AI Connection
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Saving Settings…" : "💾 Save AI Settings"}
        </button>
      </div>
    </div>
  );
}
