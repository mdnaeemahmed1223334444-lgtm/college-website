/**
 * Centralized Date & Time Utility for College Website
 * Enforces Bangladesh Standard Time (Asia/Dhaka) throughout all attendance,
 * routine, notice, and result records.
 */

export const DHAKA_TIMEZONE = "Asia/Dhaka";

/**
 * Returns current ISO date string (YYYY-MM-DD) in Asia/Dhaka timezone.
 */
export function getDhakaDate(d: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Returns yesterday's ISO date string (YYYY-MM-DD) in Asia/Dhaka timezone.
 */
export function getDhakaYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDhakaDate(d);
}

/**
 * Format date to standard Bangladesh display format: DD-MM-YYYY (e.g. 27-11-2026)
 */
export function formatDhakaDate(raw?: string | Date | null): string {
  if (!raw) return "—";

  try {
    let dateObj: Date;

    if (raw instanceof Date) {
      dateObj = raw;
    } else if (typeof raw === "string") {
      // If it's pure YYYY-MM-DD format (no time)
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
        const [y, m, d] = raw.trim().split("-");
        return `${d}-${m}-${y}`;
      }
      dateObj = new Date(raw);
    } else {
      return "—";
    }

    if (isNaN(dateObj.getTime())) return "—";

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: DHAKA_TIMEZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).formatToParts(dateObj);

    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    return `${map.day}-${map.month}-${map.year}`;
  } catch {
    return "—";
  }
}

/**
 * Format time to 12-hour format with AM/PM in Asia/Dhaka: e.g. "09:30 PM"
 */
export function formatDhakaTime(raw?: string | Date | null): string {
  if (!raw) return "—";

  try {
    // If it's a pure SQL time string (HH:mm:ss or HH:mm)
    if (typeof raw === "string" && /^(\d{1,2}):(\d{2})(:(\d{2}))?/.test(raw.trim())) {
      const match = raw.trim().match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        let hour = parseInt(match[1], 10);
        const minute = match[2];
        const ampm = hour >= 12 ? "PM" : "AM";
        const h12 = hour % 12 || 12;
        return `${String(h12).padStart(2, "0")}:${minute} ${ampm}`;
      }
    }

    const dateObj = raw instanceof Date ? raw : new Date(raw);
    if (isNaN(dateObj.getTime())) return "—";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: DHAKA_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
  } catch {
    return "—";
  }
}

/**
 * Format full date and time: e.g. "27-11-2026, 09:30 PM"
 */
export function formatDhakaDateTime(rawDate?: string | Date | null, rawTime?: string | null): string {
  if (!rawDate) return "—";

  if (rawTime) {
    const formattedDate = formatDhakaDate(rawDate);
    const formattedTime = formatDhakaTime(rawTime);
    return `${formattedDate}, ${formattedTime}`;
  }

  const formattedDate = formatDhakaDate(rawDate);
  const formattedTime = formatDhakaTime(rawDate);
  if (formattedTime === "—") return formattedDate;
  return `${formattedDate}, ${formattedTime}`;
}

/**
 * Format day of week in Asia/Dhaka: e.g. "Friday", "Saturday"
 */
export function formatDhakaDayOfWeek(raw?: string | Date | null): string {
  if (!raw) return "—";

  try {
    let dateObj: Date;
    if (raw instanceof Date) {
      dateObj = raw;
    } else if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
      // Avoid UTC midnight shifting day when parsing YYYY-MM-DD
      const [y, m, d] = raw.trim().split("-").map(Number);
      dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    } else {
      dateObj = new Date(raw);
    }

    if (isNaN(dateObj.getTime())) return "—";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: DHAKA_TIMEZONE,
      weekday: "long",
    }).format(dateObj);
  } catch {
    return "—";
  }
}
