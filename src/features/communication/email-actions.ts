"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { mainAdmin } from "@/lib/supabase/main-server";
import {
  sendBrevoEmail,
  checkBrevoConnection,
  type BrevoAttachment,
} from "@/lib/email/brevo";
import { resolveBroadcastRecipients } from "./email-recipients";
import type {
  EmailBroadcastSettings,
  BroadcastTarget,
  EmailDispatchFeedback,
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
  auto_send_on_news: true,
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
      // ignore
    }
  }
  return defaultSettings;
}

/**
 * Saves email settings to database
 */
export async function saveEmailSettingsAction(
  _prev: EmailDispatchFeedback,
  formData: FormData
): Promise<EmailDispatchFeedback> {
  try {
    await requireRole(["admin"]);
    const supabase = mainAdmin();
    if (!supabase) {
      return { success: false, error: "Database connection not available." };
    }

    const enabled = formData.get("enabled") === "true" || formData.get("enabled") === "on";
    const sender_name = (formData.get("sender_name") as string)?.trim() || defaultSettings.sender_name;
    const sender_email = (formData.get("sender_email") as string)?.trim() || defaultSettings.sender_email;
    const auto_send_on_notice =
      formData.get("auto_send_on_notice") === "true" || formData.get("auto_send_on_notice") === "on";
    const auto_send_on_news =
      formData.get("auto_send_on_news") === "true" || formData.get("auto_send_on_news") === "on";

    const current = await getEmailSettingsAction();

    const newSettings: EmailBroadcastSettings = {
      ...current,
      enabled,
      sender_name,
      sender_email,
      auto_send_on_notice,
      auto_send_on_news,
    };

    const { error } = await supabase.from("site_settings").upsert({
      key: SETTINGS_KEY,
      value: newSettings,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: `Failed to save settings: ${error.message}` };
    }

    revalidatePath("/admin/content/email");
    revalidatePath("/admin/communication/email");
    return { success: true, message: "Email settings updated successfully." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update email settings." };
  }
}

/**
 * Permanently adds or removes a blocked recipient in database
 */
export async function toggleGlobalBlockedEmailAction(
  emailOrId: string,
  action: "block" | "unblock"
): Promise<EmailDispatchFeedback> {
  try {
    await requireRole(["admin"]);
    const clean = emailOrId.trim().toLowerCase();
    if (!clean) return { success: false, error: "Invalid email or ID." };

    const supabase = mainAdmin();
    if (!supabase) return { success: false, error: "Database not connected." };

    const current = await getEmailSettingsAction();
    const existing = new Set(current.global_blocked_emails.map((s) => s.toLowerCase()));

    if (action === "block") {
      existing.add(clean);
    } else {
      existing.delete(clean);
    }

    const updated = Array.from(existing);
    await supabase.from("site_settings").upsert({
      key: SETTINGS_KEY,
      value: { ...current, global_blocked_emails: updated },
      updated_at: new Date().toISOString(),
    });

    revalidatePath("/admin/content/email");
    revalidatePath("/admin/communication/email");
    return {
      success: true,
      message: action === "block" ? `Recipient "${clean}" permanently saved as blocked.` : `Recipient "${clean}" unblocked.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update blocked list." };
  }
}

/**
 * Tests Brevo connection from admin UI
 */
export async function testBrevoConnectionAction(): Promise<EmailDispatchFeedback> {
  try {
    await requireRole(["admin"]);
    const res = await checkBrevoConnection();
    if (!res.ok) {
      return { success: false, error: res.error || "Could not reach Brevo API." };
    }

    return {
      success: true,
      message: `Brevo API connection active! Verified account email: ${res.email || "N/A"} (${res.companyName || "College Account"}).`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Connection test failed." };
  }
}

/**
 * Retrieves delivery logs
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
      // ignore
    }
  }
  return [];
}

async function appendBroadcastLog(log: BroadcastLogItem) {
  const supabase = mainAdmin();
  if (supabase) {
    try {
      const current = await getBroadcastLogsAction();
      const updated = [log, ...current].slice(0, 50); // keep last 50 logs
      await supabase.from("site_settings").upsert({
        key: LOGS_KEY,
        value: updated,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }
}

/**
 * Wraps rich body HTML in college branding and standard email styles
 */
export async function wrapWithCollegeBranding(
  bodyHtml: string,
  options?: { title?: string; preheader?: string }
): Promise<string> {
  const branding = await getBrandingSettings();
  const title = options?.title || branding.collegeName || "Dhaka Model College";
  const preheader = options?.preheader || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    h1 { font-size: 24px; font-weight: 800; color: #111827; margin: 16px 0 10px 0; line-height: 1.3; }
    h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 14px 0 8px 0; line-height: 1.35; }
    h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin: 12px 0 6px 0; line-height: 1.4; }
    p { margin: 10px 0; line-height: 1.65; color: #374151; font-size: 15px; }
    ul, ol { margin: 10px 0; padding-left: 24px; color: #374151; font-size: 15px; }
    li { margin: 4px 0; }
    blockquote { border-left: 4px solid #3b82f6; padding: 6px 16px; margin: 14px 0; color: #4b5563; background: #eff6ff; font-style: italic; border-radius: 0 8px 8px 0; }
    a { color: #2563eb; text-decoration: underline; font-weight: 500; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  </style>
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
    const studyGroup = (formData.get("study_group") as any) || undefined;
    const includeAlumni = formData.get("include_alumni") === "true" || formData.get("include_alumni") === "on";
    const individualEmail = (formData.get("individual_email") as string) || "";

    // Additional emails from dynamic rows or text inputs
    const additionalEmailsRaw = formData.getAll("additional_emails").map(String);
    const legacyAdditional = (formData.get("additional_emails_legacy") as string) || "";
    const allAdditional = [...additionalEmailsRaw, ...legacyAdditional.split(/[,\n;]+/)].filter((s) => s.trim().length > 0);

    // Excluded emails and deselected student IDs
    const excludedEmailsRaw = (formData.get("excluded_emails") as string) || "";
    const excludedStudentIds = formData.getAll("excluded_student_ids").map(String).filter(Boolean);

    const subject = (formData.get("subject") as string)?.trim();
    const rawHtml = (formData.get("html_content") as string) || "";

    if (!subject) {
      return { success: false, error: "Please enter an email subject." };
    }
    if (!rawHtml || rawHtml.trim().length === 0) {
      return { success: false, error: "Please enter email message content." };
    }

    // 1. Resolve recipients with all filters & exclusions
    const { recipients, blockedCount } = await resolveBroadcastRecipients({
      target,
      batchId,
      studyGroup,
      includeAlumni,
      additionalEmails: allAdditional,
      excludedEmails: excludedEmailsRaw,
      excludedStudentIds,
      globalBlockedEmails: settings.global_blocked_emails,
      individualEmail,
    });

    if (recipients.length === 0) {
      return {
        success: false,
        error: "No eligible recipients found matching your audience filter.",
        blockedCount,
      };
    }

    // 2. Prepare attachments (direct uploaded files converted in-memory to base64)
    const attachments: BrevoAttachment[] = [];

    // Check direct file uploads
    const uploadedFiles = formData.getAll("attachment_files") as File[];
    for (const file of uploadedFiles) {
      if (file && file.size > 0 && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          name: file.name,
          content: buffer.toString("base64"),
        });
      }
    }

    // Check URL-based attachments
    const attachmentUrl = (formData.get("attachment_url") as string)?.trim();
    const attachmentName = (formData.get("attachment_name") as string)?.trim();
    if (attachmentUrl) {
      attachments.push({
        url: attachmentUrl,
        name: attachmentName || "Document",
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
          : target === "science"
          ? "Science Students"
          : target === "business_studies"
          ? "Business Studies Students"
          : target === "humanities"
          ? "Humanities Students"
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

    revalidatePath("/admin/content/email");
    revalidatePath("/admin/communication/email");

    return {
      success: true,
      message: `Email broadcast dispatched successfully to ${recipients.length} recipient${
        recipients.length === 1 ? "" : "s"
      }!${blockedCount > 0 ? ` (${blockedCount} blocked/deselected recipients were excluded).` : ""}`,
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
  study_group?: "all" | "science" | "business_studies" | "humanities";
  additional_emails?: string | string[];
  excluded_emails?: string | string[];
  excluded_student_ids?: string[];
}) {
  try {
    const settings = await getEmailSettingsAction();
    if (!settings.enabled || !settings.auto_send_on_notice) {
      return; // Email system disabled
    }

    const { recipients, blockedCount } = await resolveBroadcastRecipients({
      target: notice.target || "all",
      batchId: notice.batch_id,
      studyGroup: notice.study_group,
      additionalEmails: notice.additional_emails,
      excludedEmails: notice.excluded_emails,
      excludedStudentIds: notice.excluded_student_ids,
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

/**
 * Automatically sends an email notification when a News & Event item is published
 */
export async function broadcastNewsEmail(news: {
  title: string;
  category?: string;
  excerpt?: string;
  content?: string;
  event_date?: string | null;
  image_url?: string | null;
  target?: BroadcastTarget;
  batch_id?: string;
  study_group?: "all" | "science" | "business_studies" | "humanities";
  additional_emails?: string | string[];
  excluded_emails?: string | string[];
  excluded_student_ids?: string[];
}) {
  try {
    const settings = await getEmailSettingsAction();
    if (!settings.enabled || settings.auto_send_on_news === false) {
      return; // Email system disabled
    }

    const { recipients, blockedCount } = await resolveBroadcastRecipients({
      target: news.target || "all",
      batchId: news.batch_id,
      studyGroup: news.study_group,
      additionalEmails: news.additional_emails,
      excludedEmails: news.excluded_emails,
      excludedStudentIds: news.excluded_student_ids,
      globalBlockedEmails: settings.global_blocked_emails,
    });

    if (recipients.length === 0) return;

    const categoryBadge = news.category
      ? `<div style="display:inline-block;background:#f3e8ff;color:#6b21a8;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:12px;">📰 ${news.category}</div>`
      : "";

    const dateBadge = news.event_date
      ? `<div style="display:inline-block;background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold;margin-bottom:12px;margin-left:6px;">📅 ${new Date(news.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>`
      : "";

    const imageTag = news.image_url
      ? `<div style="margin: 16px 0; border-radius: 8px; overflow: hidden;"><img src="${news.image_url}" alt="${news.title}" style="width: 100%; max-height: 300px; object-fit: cover; display: block;" /></div>`
      : "";

    const newsBodyHtml = `
      <div>${categoryBadge}${dateBadge}</div>
      <h2 style="margin: 8px 0 14px; font-size: 21px; font-weight: 800; color: #111827; line-height: 1.3;">${news.title}</h2>
      ${news.excerpt ? `<p style="font-size: 16px; font-weight: 600; color: #1e3a8a; margin-bottom: 14px;">${news.excerpt}</p>` : ""}
      ${imageTag}
      <div style="margin-top: 14px; line-height: 1.7; color: #374151;">
        ${news.content || "<p>Visit the college website for complete photo highlights and event coverage.</p>"}
      </div>
    `;

    const finalHtml = await wrapWithCollegeBranding(newsBodyHtml, {
      title: news.title,
      preheader: `Campus News & Event: ${news.title}`,
    });

    await sendBrevoEmail({
      to: recipients.map((r) => ({ email: r.email, name: r.name })),
      subject: `Campus News: ${news.title}`,
      htmlContent: finalHtml,
      senderName: settings.sender_name,
      senderEmail: settings.sender_email,
    });

    await appendBroadcastLog({
      id: `news-log-${Date.now()}`,
      subject: news.title,
      target_summary: `News & Event (${news.category || "General"})`,
      recipient_count: recipients.length,
      blocked_count: blockedCount,
      sent_at: new Date().toISOString(),
      status: "sent",
    });
  } catch (err) {
    console.error("broadcastNewsEmail error:", err);
  }
}
