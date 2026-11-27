import "server-only";
import { mainAdmin } from "@/lib/supabase/main-server";
import {
  type EmailAiConfig,
  defaultEmailAiConfig,
} from "@/features/communication/ai-types";

const AI_CONFIG_KEY = "email_ai_config";

/**
 * Loads current Email AI configuration from database or env fallbacks
 */
export async function getEmailAiConfig(): Promise<EmailAiConfig> {
  const supabase = mainAdmin();
  let dbConfig: Partial<EmailAiConfig> | null = null;

  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", AI_CONFIG_KEY)
        .maybeSingle();

      if (data?.value) {
        dbConfig = data.value;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to process.env if no keys are in DB
  const envGeminiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";

  const config: EmailAiConfig = {
    ...defaultEmailAiConfig,
    ...(dbConfig || {}),
  };

  // If DB has no google keys but env has one, populate as first key
  if (config.googleKeys.length === 0 && envGeminiKey) {
    config.googleKeys = [
      {
        id: "env-default",
        name: "Environment Key",
        apiKey: envGeminiKey,
        isActive: true,
        addedAt: new Date().toISOString(),
      },
    ];
  }

  return config;
}

/**
 * Saves Email AI configuration to site_settings table
 */
export async function saveEmailAiConfig(
  config: EmailAiConfig
): Promise<{ success: boolean; error?: string }> {
  const supabase = mainAdmin();
  if (!supabase) {
    return { success: false, error: "Database connection failed" };
  }

  try {
    const { error } = await supabase.from("site_settings").upsert({
      key: AI_CONFIG_KEY,
      value: config,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save AI config" };
  }
}

/**
 * Tests connection to Google Gemini or Custom AI provider
 */
export async function testAiConnection(
  config?: EmailAiConfig
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const activeConfig = config || (await getEmailAiConfig());
  const startTime = Date.now();

  try {
    if (activeConfig.provider === "google") {
      const activeKeys = activeConfig.googleKeys.filter(
        (k) => k.isActive && k.apiKey?.trim()
      );
      if (activeKeys.length === 0) {
        return {
          success: false,
          message:
            "No active Google AI Studio (Gemini) API keys found. Please add at least one valid key.",
        };
      }

      // Test the first active key
      const keyToTest = activeKeys[0].apiKey.trim();
      const model = activeConfig.googleModel || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Hello! Reply with exactly: AI connected." }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 20,
          },
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.error?.message || `HTTP ${res.status} ${res.statusText}`;
        return {
          success: false,
          message: `Google Gemini error: ${errMsg}`,
          latencyMs,
        };
      }

      const json = await res.json();
      const reply =
        json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Connected";

      return {
        success: true,
        message: `Successfully connected to Google AI Studio (${model}) in ${latencyMs}ms. Response: "${reply}"`,
        latencyMs,
      };
    } else {
      // Custom AI provider (OpenAI compatible)
      if (!activeConfig.customApiKey?.trim()) {
        return {
          success: false,
          message: "Custom AI API Key is required.",
        };
      }

      let baseUrl = (activeConfig.customBaseUrl || "https://api.openai.com/v1")
        .trim()
        .replace(/\/+$/, "");
      if (!baseUrl.endsWith("/chat/completions")) {
        baseUrl += "/chat/completions";
      }

      const model = activeConfig.customModel || "gpt-4o-mini";

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeConfig.customApiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "user", content: "Hello! Reply with exactly: Custom AI connected." },
          ],
          max_tokens: 20,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.error?.message || `HTTP ${res.status} ${res.statusText}`;
        return {
          success: false,
          message: `Custom AI error: ${errMsg}`,
          latencyMs,
        };
      }

      const json = await res.json();
      const reply =
        json.choices?.[0]?.message?.content?.trim() || "Connected";

      return {
        success: true,
        message: `Successfully connected to Custom AI (${model}) in ${latencyMs}ms. Response: "${reply}"`,
        latencyMs,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || "Network error"}`,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Converts raw email draft into a stunning, responsive, inline-styled HTML email.
 * Includes automatic Gemini multi-key rotation on 429 quota errors.
 */
export async function generateBeautifiedEmailHtml({
  rawText,
  subject,
  style = "institutional",
  collegeName = "Haji Rahmatullah Model Degree College",
}: {
  rawText: string;
  subject?: string;
  style?: "institutional" | "urgent" | "celebration" | "clean";
  collegeName?: string;
}): Promise<{ success: boolean; html?: string; error?: string }> {
  if (!rawText || rawText.trim().length === 0) {
    return { success: false, error: "Please enter the raw text of your email." };
  }

  const config = await getEmailAiConfig();
  const title = subject?.trim() || "Official College Announcement";

  // System Prompt for generating stunning HTML emails
  const prompt = `You are a master institutional email designer and senior communications strategist for "${collegeName}".
Your task is to transform the following raw draft into a stunning, professional, and responsive HTML email template.

### Email Details:
- College Name: ${collegeName}
- Subject / Title: ${title}
- Selected Visual Style: ${style.toUpperCase()}

### Raw Draft Input:
"""
${rawText.trim()}
"""

### Design & HTML Requirements:
1. Output format: Return ONLY the raw HTML string for the email body.
   - Do NOT wrap in markdown code blocks (NO \`\`\`html or \`\`\`).
   - Do NOT include <html> or <head> tags; provide the top-level container:
     <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
     ...
     </div>
2. Header Section:
   - Modern branded banner containing "${collegeName}".
   - Tagline / Badge according to style:
     ${
       style === "urgent"
         ? 'Emergency / Urgent badge: Red/Amber background (#fee2e2), dark red text (#991b1b).'
         : style === "celebration"
         ? 'Celebration / Achievement badge: Emerald/Purple gradient or gold accent.'
         : style === "clean"
         ? 'Minimalist slate header (#0f172a), subtle silver accent.'
         : 'Official Institutional Header: Deep Navy (#1e3a8a) with rich gold accent (#c5a46d).'
     }
3. Content & Typography:
   - Title: <h2> or <h1> with bold, crisp styling (22px to 26px).
   - Paragraphs: 15px font size, line-height 1.65, text color #374151.
   - Key Information / Bullet Points: Turn any dates, times, schedules, instructions, or rules into stylish highlight boxes or styled cards with subtle borders and icons (e.g. 📅, ⏰, 📍, ⚠️, 📌).
   - Action Items: If the text mentions links, forms, or actions, render an elegant centered CTA button with inline styles.
4. Professional Footer:
   - Formal sign-off: "Office of Communications & Administration", College name, and automated system disclaimer.
5. All CSS MUST be 100% INLINE on HTML elements (e.g. style="..."). No <style> tags or CSS classes because email clients like Gmail strip them.`;

  try {
    if (config.provider === "google") {
      const activeKeys = config.googleKeys.filter(
        (k) => k.isActive && k.apiKey?.trim()
      );
      if (activeKeys.length === 0) {
        return {
          success: false,
          error:
            "No active Google AI Studio (Gemini) API keys configured. Please configure your key in Email Settings.",
        };
      }

      const model = config.googleModel || "gemini-2.0-flash";
      let lastError = "";

      // Try active keys with automatic fallback on 429 quota or errors
      for (let i = 0; i < activeKeys.length; i++) {
        const keyItem = activeKeys[i];
        const apiKey = keyItem.apiKey.trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 3500,
              },
            }),
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const errMessage =
              errJson.error?.message || `HTTP ${res.status} ${res.statusText}`;

            // If quota limit (429), try next key in list
            if (res.status === 429 || errMessage.toLowerCase().includes("quota")) {
              lastError = `Key ${keyItem.name || i + 1} reached quota.`;
              continue;
            } else {
              lastError = errMessage;
              continue;
            }
          }

          const json = await res.json();
          let generated =
            json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (!generated) {
            lastError = "AI returned empty content.";
            continue;
          }

          // Strip markdown code block if present
          generated = cleanMarkdownCodeblock(generated);
          return { success: true, html: generated };
        } catch (fetchErr: any) {
          lastError = fetchErr.message;
        }
      }

      return {
        success: false,
        error: `Google AI generation failed: ${lastError || "All API keys were exhausted."}`,
      };
    } else {
      // Custom AI Provider (OpenAI Compatible)
      if (!config.customApiKey?.trim()) {
        return {
          success: false,
          error: "Custom AI API Key is required.",
        };
      }

      let baseUrl = (config.customBaseUrl || "https://api.openai.com/v1")
        .trim()
        .replace(/\/+$/, "");
      if (!baseUrl.endsWith("/chat/completions")) {
        baseUrl += "/chat/completions";
      }

      const model = config.customModel || "gpt-4o-mini";

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.customApiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert HTML email designer. Output ONLY valid inline-styled HTML without markdown backticks.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.35,
          max_tokens: 3500,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          error:
            errJson.error?.message || `Custom AI HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const json = await res.json();
      let generated = json.choices?.[0]?.message?.content?.trim();

      if (!generated) {
        return { success: false, error: "Custom AI returned empty output." };
      }

      generated = cleanMarkdownCodeblock(generated);
      return { success: true, html: generated };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to generate email template with AI",
    };
  }
}

function cleanMarkdownCodeblock(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```html")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
