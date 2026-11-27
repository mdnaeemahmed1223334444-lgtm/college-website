import "server-only";

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoAttachment {
  url?: string;
  content?: string; // base64 string
  name: string;
}

export interface BrevoSendPayload {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  senderName?: string;
  senderEmail?: string;
  attachments?: BrevoAttachment[];
}

export interface BrevoSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipientCount?: number;
}

/**
 * Returns the active Brevo API key from environment
 */
export function getBrevoApiKey(): string {
  return process.env.BREVO_API_KEY || "";
}

/**
 * Returns default sender info
 */
export function getBrevoSender(): { name: string; email: string } {
  return {
    name: process.env.BREVO_SENDER_NAME || "College Administration",
    email: process.env.BREVO_SENDER_EMAIL || "admin@college.edu",
  };
}

/**
 * Tests connection with Brevo API to check if the API key is active
 */
export async function checkBrevoConnection(): Promise<{ ok: boolean; email?: string; companyName?: string; error?: string }> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { ok: false, error: "BREVO_API_KEY is not configured in environment." };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      method: "GET",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.message || `Brevo returned HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      ok: true,
      email: data.email,
      companyName: data.companyName,
    };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to connect to Brevo API" };
  }
}

/**
 * Dispatches an email (or batch email) via Brevo's transactional REST API.
 * Uses Brevo's messageVersions to deliver to multiple recipients in a single HTTP request.
 */
export async function sendBrevoEmail(payload: BrevoSendPayload): Promise<BrevoSendResult> {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    return { success: false, error: "Brevo API key is not configured." };
  }

  if (!payload.to || payload.to.length === 0) {
    return { success: false, error: "No recipients provided for email dispatch." };
  }

  const defaultSender = getBrevoSender();
  const senderName = payload.senderName || defaultSender.name;
  const senderEmail = payload.senderEmail || defaultSender.email;

  // Filter valid email addresses
  const validRecipients = payload.to.filter(
    (r) => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())
  );

  if (validRecipients.length === 0) {
    return { success: false, error: "None of the recipient email addresses are valid." };
  }

  // Deduplicate by lowercase email
  const uniqueRecipientsMap = new Map<string, BrevoRecipient>();
  for (const r of validRecipients) {
    uniqueRecipientsMap.set(r.email.toLowerCase().trim(), {
      email: r.email.trim(),
      name: r.name || r.email.split("@")[0],
    });
  }
  const uniqueRecipients = Array.from(uniqueRecipientsMap.values());

  // Prepare Brevo request body
  const requestBody: Record<string, any> = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    subject: payload.subject,
    htmlContent: payload.htmlContent,
  };

  if (payload.textContent) {
    requestBody.textContent = payload.textContent;
  }

  // Format attachments if present
  if (payload.attachments && payload.attachments.length > 0) {
    requestBody.attachment = payload.attachments.map((att) => {
      if (att.url) {
        return { url: att.url, name: att.name };
      }
      return { content: att.content, name: att.name };
    });
  }

  // For multi-recipients (more than 1), use Brevo messageVersions so each recipient sees their own email
  if (uniqueRecipients.length > 1) {
    requestBody.messageVersions = uniqueRecipients.map((rec) => ({
      to: [{ email: rec.email, name: rec.name }],
    }));
  } else {
    requestBody.to = [{ email: uniqueRecipients[0].email, name: uniqueRecipients[0].name }];
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const resJson = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Brevo API error:", resJson);
      return {
        success: false,
        error: resJson.message || `Brevo API returned error status ${res.status}`,
        recipientCount: 0,
      };
    }

    return {
      success: true,
      messageId: resJson.messageId || resJson.messageIds?.[0] || "sent",
      recipientCount: uniqueRecipients.length,
    };
  } catch (err: any) {
    console.error("Error sending email via Brevo:", err);
    return {
      success: false,
      error: err.message || "Network error while connecting to Brevo",
      recipientCount: 0,
    };
  }
}
