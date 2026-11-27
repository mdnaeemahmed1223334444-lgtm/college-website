"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import {
  getEmailAiConfig,
  saveEmailAiConfig,
  testAiConnection,
  generateBeautifiedEmailHtml,
} from "@/lib/ai/email-ai-service";
import type { EmailAiConfig } from "./ai-types";
import { getBrandingSettings } from "@/features/website/queries";

/**
 * Returns current Email AI configuration
 */
export async function getEmailAiConfigAction(): Promise<EmailAiConfig> {
  await requireRole(["admin"]);
  return getEmailAiConfig();
}

/**
 * Saves Email AI configuration
 */
export async function saveEmailAiConfigAction(
  config: EmailAiConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(["admin"]);
    const res = await saveEmailAiConfig(config);
    if (res.success) {
      revalidatePath("/admin/communication/email");
      revalidatePath("/admin/content/email");
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || "Unauthorized" };
  }
}

/**
 * Tests connection to configured AI
 */
export async function testAiConfigAction(
  config?: EmailAiConfig
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  try {
    await requireRole(["admin"]);
    return await testAiConnection(config);
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to test AI connection",
    };
  }
}

/**
 * Transforms raw email text into a stunning HTML email using AI
 */
export async function generateAiEmailHtmlAction({
  rawText,
  subject,
  style = "institutional",
}: {
  rawText: string;
  subject?: string;
  style?: "institutional" | "urgent" | "celebration" | "clean";
}): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    await requireRole(["admin"]);
    const branding = await getBrandingSettings();
    const collegeName = branding?.collegeName || "Haji Rahmatullah Model Degree College";

    return await generateBeautifiedEmailHtml({
      rawText,
      subject,
      style,
      collegeName,
    });
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to generate email template",
    };
  }
}
