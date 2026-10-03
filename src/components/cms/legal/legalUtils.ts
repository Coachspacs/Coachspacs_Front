/**
 * Utilities for Legal Pages CMS Editor
 */

/**
 * Strips manual leading numbers like "1. ", "2- ", "(3) ", "٤. " from clause titles safely.
 */
export function stripLeadingNumber(title?: string): string {
  if (!title) return "";
  // Matches Latin and Arabic numerals followed by dots, dashes, colons, or brackets
  return title
    .replace(/^[\s([0-9\u0660-\u0669]+[.\-):\]\s]+\s*/, "")
    .trim();
}

/**
 * Formats a Date object or ISO date string (YYYY-MM-DD) into bilingual text.
 * AR: e.g. "3 أكتوبر 2026"
 * EN: e.g. "October 3, 2026"
 */
export function formatLegalDate(
  dateInput: string | Date = new Date()
): { ar: string; en: string; iso: string } {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const year = validDate.getFullYear();
  const month = validDate.getMonth();
  const day = validDate.getDate();

  const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const AR_MONTHS = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const EN_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const ar = `${day} ${AR_MONTHS[month]} ${year}`;
  const en = `${EN_MONTHS[month]} ${day}, ${year}`;

  return { ar, en, iso };
}

/**
 * Converts legacy plaintext bullets (• or -) into clean HTML list structure without losing any content.
 */
export function convertBulletTextToHtml(rawText: string): string {
  if (!rawText) return "";
  const trimmed = rawText.trim();
  if (trimmed.startsWith("<p>") || trimmed.startsWith("<ul>") || trimmed.startsWith("<ol>")) {
    return rawText; // already HTML
  }

  const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean);
  const result: string[] = [];

  for (const para of paragraphs) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
    const hasBullets = lines.some((l) => /^[•\-\*]\s+/.test(l));

    if (hasBullets) {
      const introLines: string[] = [];
      const listItems: string[] = [];

      for (const line of lines) {
        if (/^[•\-\*]\s+/.test(line)) {
          const itemContent = line.replace(/^[•\-\*]\s+/, "");
          listItems.push(`<li>${sanitizeInlineHtml(itemContent)}</li>`);
        } else if (listItems.length === 0) {
          introLines.push(sanitizeInlineHtml(line));
        } else {
          // Additional text after list
          listItems[listItems.length - 1] = listItems[listItems.length - 1].replace(
            /<\/li>$/,
            `<br/>${sanitizeInlineHtml(line)}</li>`
          );
        }
      }

      if (introLines.length > 0) {
        result.push(`<p>${introLines.join("<br/>")}</p>`);
      }
      if (listItems.length > 0) {
        result.push(`<ul>${listItems.join("")}</ul>`);
      }
    } else {
      result.push(`<p>${lines.map((l) => sanitizeInlineHtml(l)).join("<br/>")}</p>`);
    }
  }

  return result.join("");
}

/**
 * Sanitizes inline HTML, escaping malicious tags while keeping safe formatting:
 * <strong>, <b>, <em>, <i>, <u>, <a>, <code>, <br>
 */
export function sanitizeInlineHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Full HTML sanitizer for rich text body
 */
export function sanitizeLegalHtml(html: string): string {
  if (!html) return "";
  const clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");

  return clean;
}

/**
 * Email validation and branded domain detector
 */
export function validateLegalEmail(email: string): {
  isValid: boolean;
  isBranded: boolean;
  message?: string;
} {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, isBranded: false, message: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(trimmed);

  if (!isValid) {
    return { isValid: false, isBranded: false, message: "Invalid email format" };
  }

  const genericDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"];
  const domain = trimmed.split("@")[1]?.toLowerCase() || "";
  const isBranded = !genericDomains.includes(domain);

  return { isValid: true, isBranded };
}
