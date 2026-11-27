"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { mainAdmin } from "@/lib/supabase/main-server";
import {
  sendBrevoEmail,
  checkBrevoConnection,
  getBrevoSender,
  type BrevoAttachment,
} from "@/lib/email/brevo";
import { resolveBroadcastRecipients } from "./email-recipients";
import type {
  EmailBroadcastSettings,
  EmailDispatchFeedback,
  BroadcastTarget,
  BroadcastLogItem,
} from "./email-types";
import { getBrandingSettings } from "@/features/website/queries";

const SETTINGS_KEY = "email_broadcast_settings";
const LOGS_KEY = "email_broadcast_logs";

const defaultSettings: EmailBroadcastSettings = {
  enabled: true,
  sender_name: "Dhaka Model College",
  sender_email: "mrgaming111223@gmail.com",
  auto_send_on_notice: true,
  global_blocked_emails: [],
};

/**
 * Loads email settings from database
 */
export async function getEmailSettingsAction(): Promise<EmailBroadcastSettings> {
  const supabase = mainAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .maybeSingle();

      if (data?.value) {
        return {
          ...defaultSettings,
          ...data.value,
          global_blocked_emails: Array.isArray(data.value.global_blocked_emails)
            ? data.value.global_blocked_emails
            : [],
        };
      }
    } catch {
      // fallback
    }
  }
  const defaultEnvSender = getBrevoSender();
  return {
    ...defaultSettings,
    sender_name: defaultEnvSender.name,
    sender_email: defaultEnvSender.email,
  };
}

/**
 * Saves email settings
 */
export async function saveEmailSettingsAction(
  settings: Partial<EmailBroadcastSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(["admin"]);
    const current = await getEmailSettingsAction();
    const merged = { ...current, ...settings };

    const supabase = mainAdmin();
    if (supabase) {
      const { error } = await supabase.from("site_settings").upsert({
        key: SETTINGS_KEY,
        value: merged,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    revalidatePath("/admin/communication/email");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save email settings" };
  }
}

/**
 * Adds or removes an email or student code from the global blacklist
 */
export async function toggleGlobalBlockedEmailAction(
  item: string,
  action: "block" | "unblock"
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(["admin"]);
    const clean = item.trim().toLowerCase();
    if (!clean) return { success: false, error: "Please enter an email or student ID to block." };

    const current = await getEmailSettingsAction();
    let updatedList = [...current.global_blocked_emails];

    if (action === "block") {
      if (!updatedList.includes(clean)) {
        updatedList.push(clean);
      }
    } else {
      updatedList = updatedList.filter((x) => x.toLowerCase() !== clean);
    }

    return await saveEmailSettingsAction({ global_blocked_emails: updatedList });
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update blocklist" };
  }
}

/**
 * Tests the Brevo API connection
 */
export async function testBrevoConnectionAction() {
  await requireRole(["admin"]);
  return await checkBrevoConnection();
}

/**
 * Loads recent broadcast logs
 */
export async function getBroadcastLogsAction(): Promise<BroadcastLogItem[]> {
  const supabase = mainAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", LOGS_KEY)
        .maybeSingle();

      if (data?.value && Array.isArray(data.value)) {
        return data.value;
      }
    } catch {
      // fallback
    }
  }
  return [];
}

async function appendBroadcastLog(log: BroadcastLogItem) {
  try {
    const supabase = mainAdmin();
    if (supabase) {
      const current = await getBroadcastLogsAction();
      const updated = [log, ...current].slice(0, 50); // keep last 50 logs
      await supabase.from("site_settings").upsert({
        key: LOGS_KEY,
        value: updated,
        updated_at: new Date().toISOString(),
      });
    }
  } catch {
    // ignore
  }
}

/**
 * Generates an institutional HTML email wrapper with college branding header and footer
 */
export async function wrapWithCollegeBranding(
  bodyHtml: string,
  options?: { title?: string; preheader?: string }
): Promise<string> {
  const branding = await getBrandingSettings();
  const title = options?.title || branding.collegeName;
  const preheader = options?.preheader || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  
  <div style="max-width: 640px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
    
    <!-- College Header -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 24px; text-align: center; color: #ffffff;">
      ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="${branding.collegeName}" style="height: 52px; width: 52px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; border: 2px solid rgba(255,255,255,0.4);" />` : ""}
      <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">${branding.collegeName}</h1>
      <p style="margin: 4px 0 0; font-size: 12px; color: #93c5fd; letter-spacing: 0.05em; text-transform: uppercase;">Official Campus Communication</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px 28px; color: #1f2937; font-size: 15px; line-height: 1.6;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #f3f4f6; color: #6b7280; font-size: 12px;">
      <p style="margin: 0 0 6px; font-weight: 600; color: #374151;">${branding.collegeName}</p>
      <p style="margin: 0; font-size: 11px;">EIIN: ${branding.eiin || "134250"} • College Code: ${branding.collegeCode || "1082"}</p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">This is an official administrative notice. You received this email as an enrolled student or faculty member.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Server action to send an ad-hoc custom email or announcement broadcast
 */
export async function sendCustomEmailAction(
  _prev: EmailDispatchFeedback,
  formData: FormData
): Promise<EmailDispatchFeedback> {
  try {
    await requireRole(["admin"]);

    const settings = await getEmailSettingsAction();
    if (!settings.enabled) {
      return {
        success: false,
        error: "The email sending system is currently turned OFF. Enable it in settings to send emails.",
      };
    }

    const target = (formData.get("target") as BroadcastTarget) || "all";
    const batchId = (formData.get("batch_id") as string) || undefined;
    const includeAlumni = formData.get("include_alumni") === "true" || formData.get("include_alumni") === "on";
    const additionalEmails = (formData.get("additional_emails") as string) || "";
    const excludedEmails = (formData.get("excluded_emails") as string) || "";
    const individualEmail = (formData.get("individual_email") as string) || "";

    const subject = (formData.get("subject") as string)?.trim();
    const rawHtml = (formData.get("html_content") as string) || "";
    const attachmentUrl = (formData.get("attachment_url") as string)?.trim() || undefined;
    const attachmentName = (formData.get("attachment_name") as string)?.trim() || undefined;

    if (!subject) {
      return { success: false, error: "Please enter an email subject." };
    }
    if (!rawHtml || rawHtml.trim().length === 0) {
      return { success: false, error: "Please enter email message content." };
    }

    // 1. Resolve recipients
    const { recipients, blockedCount } = await resolveBroadcastRecipients({
      target,
      batchId,
      includeAlumni,
      additionalEmails,
      excludedEmails,
      globalBlockedEmails: settings.global_blocked_emails,
      individualEmail,
    });

    if (recipients.length === 0) {
      return {
        success: false,
        error: "No eligible recipients found matching your target criteria.",
        blockedCount,
      };
    }

    // 2. Prepare attachments if provided
    const attachments: BrevoAttachment[] = [];
    if (attachmentUrl) {
      attachments.push({
        url: attachmentUrl,
        name: attachmentName || "Attachment",
      });
    }

    // 3. Wrap email with college branding
    const finalHtml = await wrapWithCollegeBranding(rawHtml, { title: subject });

    // 4. Send via Brevo
    const result = await sendBrevoEmail({
      to: recipients.map((r) => ({ email: r.email, name: r.name })),
      subject,
      htmlContent: finalHtml,
      senderName: settings.sender_name,
      senderEmail: settings.sender_email,
      attachments,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to dispatch email via Brevo.",
      };
    }

    // 5. Append to log
    await appendBroadcastLog({
      id: `log-${Date.now()}`,
      subject,
      target_summary:
        target === "batch"
          ? `Batch: ${batchId || "Specific"}`
          : target === "students"
          ? "Students Only"
          : target === "teachers"
          ? "Teachers Only"
          : target === "individual"
          ? `Individual: ${individualEmail}`
          : "All Campus",
      recipient_count: recipients.length,
      blocked_count: blockedCount,
      sent_at: new Date().toISOString(),
      status: "sent",
    });

    revalidatePath("/admin/communication/email");

    return {
      success: true,
      message: `Email broadcast dispatched successfully to ${recipients.length} recipient${
        recipients.length === 1 ? "" : "s"
      }.${blockedCount > 0 ? ` (${blockedCount} blocked recipients were excluded).` : ""}`,
      recipientCount: recipients.length,
      blockedCount,
    };
  } catch (err: any) {
    console.error("sendCustomEmailAction error:", err);
    return { success: false, error: err.message || "An error occurred while sending email." };
  }
}

/**
 * Automatically sends an email notification when a notice is published
 */
export async function broadcastNoticeEmail(notice: {
  title: string;
  category?: string;
  content?: string;
  attachment_url?: string | null;
  is_urgent?: boolean;
  target?: BroadcastTarget;
  batch_id?: string;
  additional_emails?: string;
  excluded_emails?: string;
}) {
  try {
    const settings = await getEmailSettingsAction();
    if (!settings.enabled || !settings.auto_send_on_notice) {
      return; // Email system disabled
    }

    const { recipients, blockedCount } = await resolveBroadcastRecipients({
      target: notice.target || "all",
      batchId: notice.batch_id,
      additionalEmails: notice.additional_emails,
      excludedEmails: notice.excluded_emails,
      globalBlockedEmails: settings.global_blocked_emails,
    });

    if (recipients.length === 0) return;

    // Build notice email content
    const urgentBadge = notice.is_urgent
      ? `<div style="display:inline-block;background:#fee2e2;color:#b91c1c;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:12px;text-transform:uppercase;">🚨 Urgent Announcement</div>`
      : "";

    const categoryBadge = notice.category
      ? `<div style="display:inline-block;background:#e0e7ff;color:#3730a3;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:12px;margin-right:6px;">${notice.category}</div>`
      : "";

    const attachmentBtn = notice.attachment_url
      ? `<div style="margin-top:24px;"><a href="${notice.attachment_url}" target="_blank" style="display:inline-block;background:#1e40af;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;">📎 Download Official Document</a></div>`
      : "";

    const noticeBodyHtml = `
      ${urgentBadge} ${categoryBadge}
      <h2 style="margin: 8px 0 16px; font-size: 20px; font-weight: 800; color: #111827; line-height: 1.3;">${notice.title}</h2>
      <div style="margin-top: 12px; line-height: 1.7; color: #374151;">
        ${notice.content || "<p>Please view the attached document or visit the college portal for full details.</p>"}
      </div>
      ${attachmentBtn}
    `;

    const finalHtml = await wrapWithCollegeBranding(noticeBodyHtml, {
      title: notice.title,
      preheader: `New College Announcement: ${notice.title}`,
    });

    const attachments: BrevoAttachment[] = [];
    if (notice.attachment_url) {
      attachments.push({
        url: notice.attachment_url,
        name: "Official-Notice-Document",
      });
    }

    await sendBrevoEmail({
      to: recipients.map((r) => ({ email: r.email, name: r.name })),
      subject: `${notice.is_urgent ? "[URGENT] " : ""}${notice.title}`,
      htmlContent: finalHtml,
      senderName: settings.sender_name,
      senderEmail: settings.sender_email,
      attachments,
    });

    await appendBroadcastLog({
      id: `notice-log-${Date.now()}`,
      subject: notice.title,
      target_summary: `Notice (${notice.category || "General"})`,
      recipient_count: recipients.length,
      blocked_count: blockedCount,
      sent_at: new Date().toISOString(),
      status: "sent",
    });
  } catch (err) {
    console.error("broadcastNoticeEmail error:", err);
  }
}
