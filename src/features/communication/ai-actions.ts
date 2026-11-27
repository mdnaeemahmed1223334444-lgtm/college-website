"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import {
  getEmailAiConfig,
  saveEmailAiConfig,
  testAiConnection,
  generateBeautifiedEmailHtml,
} from "@/lib/ai/email-ai-service";
import {
  getAllEmailTemplates,
  saveEmailTemplateItem,
  deleteEmailTemplateItem,
  resetEmailTemplatesToDefault,
} from "@/lib/ai/email-template-service";
import type { EmailAiConfig, EmailTemplateItem } from "./ai-types";
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
 * Transforms raw email text into a stunning, phone & PC responsive HTML email using AI
 */
export async function generateAiEmailHtmlAction({
  rawText,
  subject,
  style = "institutional",
  templateId,
  customPromptInstructions,
  primaryColor,
  accentColor,
  badgeLabel,
}: {
  rawText: string;
  subject?: string;
  style?: string;
  templateId?: string;
  customPromptInstructions?: string;
  primaryColor?: string;
  accentColor?: string;
  badgeLabel?: string;
}): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    await requireRole(["admin"]);
    const branding = await getBrandingSettings();
    const collegeName = branding?.collegeName || "Haji Rahmatullah Model Degree College";

    return await generateBeautifiedEmailHtml({
      rawText,
      subject,
      style,
      templateId,
      customPromptInstructions,
      primaryColor,
      accentColor,
      badgeLabel,
      collegeName,
    });
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to generate email template",
    };
  }
}

/**
 * Returns all email templates (built-in + custom)
 */
export async function getEmailTemplatesAction(): Promise<EmailTemplateItem[]> {
  try {
    await requireRole(["admin"]);
    return await getAllEmailTemplates();
  } catch {
    return [];
  }
}

/**
 * Saves or updates an email template
 */
export async function saveEmailTemplateAction(
  template: EmailTemplateItem
): Promise<{ success: boolean; template?: EmailTemplateItem; error?: string }> {
  try {
    await requireRole(["admin"]);
    const res = await saveEmailTemplateItem(template);
    if (res.success) {
      revalidatePath("/admin/communication/email");
      revalidatePath("/admin/content/email");
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save template" };
  }
}

/**
 * Deletes an email template
 */
export async function deleteEmailTemplateAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(["admin"]);
    const res = await deleteEmailTemplateItem(id);
    if (res.success) {
      revalidatePath("/admin/communication/email");
      revalidatePath("/admin/content/email");
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete template" };
  }
}

/**
 * Resets templates back to default system templates
 */
export async function resetEmailTemplatesAction(): Promise<{
  success: boolean;
  templates?: EmailTemplateItem[];
  error?: string;
}> {
  try {
    await requireRole(["admin"]);
    const res = await resetEmailTemplatesToDefault();
    if (res.success) {
      revalidatePath("/admin/communication/email");
      revalidatePath("/admin/content/email");
    }
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reset templates" };
  }
}
