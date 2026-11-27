import "server-only";
import { mainAdmin } from "@/lib/supabase/main-server";
import {
  type EmailAiConfig,
  defaultEmailAiConfig,
} from "@/features/communication/ai-types";

const AI_CONFIG_KEY = "email_ai_config";

/**
 * Resolves and auto-upgrades Google Gemini model IDs.
 * Google AI Studio deprecated gemini-2.0-flash and gemini-1.5-* in favor of gemini-3.8-flash.
 */
export function resolveGoogleModel(rawModel?: string): string {
  const m = (rawModel || "").trim();
  if (!m) return "gemini-3.8-flash";
  if (
    m.includes("gemini-2.0") ||
    m.includes("gemini-1.5") ||
    m === "gemini-pro" ||
    m === "gemini-flash"
  ) {
    if (m.includes("pro")) return "gemini-3.8-pro";
    return "gemini-3.8-flash";
  }
  return m;
}

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
      const model = resolveGoogleModel(activeConfig.googleModel);
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
 * Converts raw email draft into a stunning, responsive, mobile (phone) & PC desktop compatible HTML email.
 * Includes automatic Gemini multi-key rotation on 429 quota errors.
 */
export async function generateBeautifiedEmailHtml({
  rawText,
  subject,
  style = "institutional",
  templateId,
  customPromptInstructions,
  primaryColor,
  accentColor,
  badgeLabel,
  collegeName = "Haji Rahmatullah Model Degree College",
  logoUrl,
}: {
  rawText: string;
  subject?: string;
  style?: string;
  templateId?: string;
  customPromptInstructions?: string;
  primaryColor?: string;
  accentColor?: string;
  badgeLabel?: string;
  collegeName?: string;
  logoUrl?: string;
}): Promise<{ success: boolean; html?: string; error?: string }> {
  if (!rawText || rawText.trim().length === 0) {
    return { success: false, error: "Please enter the raw text of your email." };
  }

  const config = await getEmailAiConfig();
  const title = subject?.trim() || "Official College Announcement";

  // Palette & style definitions
  let pColor = primaryColor || "#1e3a8a";
  let aColor = accentColor || "#c5a46d";
  let badge = badgeLabel || "OFFICIAL NOTICE";

  if (style === "urgent") {
    pColor = primaryColor || "#b91c1c";
    aColor = accentColor || "#fee2e2";
    badge = badgeLabel || "URGENT ALERT";
  } else if (style === "celebration") {
    pColor = primaryColor || "#4f46e5";
    aColor = accentColor || "#a855f7";
    badge = badgeLabel || "CAMPUS CELEBRATION";
  } else if (style === "clean") {
    pColor = primaryColor || "#0f172a";
    aColor = accentColor || "#0284c7";
    badge = badgeLabel || "CAMPUS UPDATE";
  } else if (style === "academic") {
    pColor = primaryColor || "#065f46";
    aColor = accentColor || "#d97706";
    badge = badgeLabel || "ACADEMIC CIRCULAR";
  }

  // System Prompt for generating stunning, bulletproof mobile & PC HTML emails
  const prompt = `You are a world-class HTML email designer and senior communications director for "${collegeName}".
Your mission is to transform the user's raw draft into a stunning, executive-grade, and 100% responsive HTML email that looks flawless on both smartphones (iOS Mail, Android Gmail, Samsung Mail) and desktop PCs (Outlook, Gmail Web, Apple Mail).

### Core Parameters:
- College / Institution: ${collegeName}
- Subject / Headline: ${title}
- Visual Theme Style: ${style.toUpperCase()} (Primary Color: ${pColor}, Accent/Highlight: ${aColor}, Badge: "${badge}")
${customPromptInstructions ? `- Custom Style Instructions: ${customPromptInstructions}` : ""}

### User's Raw Draft:
"""
${rawText.trim()}
"""

### Strict Email Client & Mobile/PC Compatibility Standards:
1. **Outer & Inner Architecture (100% Fluid & Desktop/Mobile Compatible):**
   - Output ONLY the HTML markup. NO \`\`\`html or markdown wrapper.
   - Start with an outer fluid table:
     <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width:100% !important; min-width:100%; background-color:#f8fafc; margin:0; padding:20px 10px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
       <tr>
         <td align="center" style="padding:0;">
           <!-- Card container: 100% width on mobile phone screens, max 600px on PC monitors -->
           <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.06); border:1px solid #e2e8f0; margin:0 auto;">
   - Close all tables cleanly at the end.

2. **Branded Header Banner (Stunning Visual Appeal with Official College Logo):**
   - Top banner with background color "${pColor}" (or elegant gradient if celebration).
   - Padding: 30px 24px on desktop, scaling smoothly on mobile.
   - Text alignment: Center.
${
  logoUrl
    ? `   - **Official Logo Image:** Render the official college logo centered at the top of the header:
     <div style="text-align:center; margin-bottom:12px;">
       <img src="${logoUrl}" alt="${collegeName}" width="60" height="60" style="width:60px; height:60px; max-width:60px; border-radius:50%; object-fit:cover; display:inline-block; border:2px solid rgba(255,255,255,0.7); box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
     </div>`
    : `   - Institution Monogram: Render a circular gold/white monogram symbol in the header.`
}
   - Branded institution name: "${collegeName}" in crisp white font (font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #ffffff; opacity: 0.95;).
   - Distinctive pill badge:
     <span style="display:inline-block; margin-top:8px; padding:4px 12px; border-radius:9999px; font-size:11px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; background-color:rgba(255,255,255,0.18); color:#ffffff; border:1px solid rgba(255,255,255,0.3);">${badge}</span>

3. **Content Body & Typography (Readable & Impactful):**
   - Inside padding: 30px 24px.
   - Heading (Subject): <h1 style="margin:0 0 16px 0; font-size:23px; line-height:1.35; font-weight:800; color:#0f172a; letter-spacing:-0.01em;">${title}</h1>
   - Paragraphs: font-size 15px, line-height 1.65, color #334155, margin 0 0 14px 0.
   - **Key Information Cards:** If the draft mentions dates, times, deadlines, rooms, rules, or requirements, organize them into a beautiful highlight card:
     <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9; border-left:4px solid ${pColor}; border-radius:8px; margin:18px 0;">
       <tr>
         <td style="padding:14px 18px; font-size:14px; color:#1e293b; line-height:1.6;">
           ... highlight items with icons 📅 ⏰ 📍 📌 ⚠️ ...
         </td>
       </tr>
     </table>
   - **Call-to-Action (CTA):** If the text mentions an action (e.g. view schedule, submit form, visit portal, attend meeting), provide an eye-catching centered button:
     <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:24px auto;">
       <tr>
         <td align="center" style="border-radius:10px; background-color:${pColor}; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
           <a href="#" target="_blank" style="font-size:14px; font-weight:700; color:#ffffff !important; text-decoration:none; padding:13px 28px; display:inline-block; border-radius:10px; letter-spacing:0.02em;">
             Take Action &rarr;
           </a>
         </td>
       </tr>
     </table>

4. **Executive Institutional Footer:**
   - Background: #f8fafc with top border 1px solid #e2e8f0, padding 24px 20px, text-align center.
   - Formal sign-off: "Office of Academic Administration & Communications" • "${collegeName}".
   - Automated system notice: "This is an official communication delivered via the college dispatch network."

5. **100% INLINE CSS Only:**
   - Every single <table>, <tr>, <td>, <p>, <span>, <a>, <h1> MUST have full inline style="..." properties.
   - Do NOT use <style> tags or external CSS classes.`;

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

      const model = resolveGoogleModel(config.googleModel);
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
