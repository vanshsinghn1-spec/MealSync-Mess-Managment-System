/**
 * Automated "SAC - Mess Affairs" Email Announcement Parser
 * 
 * Issue #1: Processes official mess update emails sent to student @iiitdm.ac.in addresses
 * by "SAC - Mess Affairs" (such as 1-day temporary menu substitutions, emergency closures,
 * water/maintenance notices, special feasts) and creates real-time system announcements.
 */

const Notification = require("../models/Notification");

/**
 * Normalized official SAC email patterns and keywords
 */
const SAC_SENDER_PATTERNS = [
  "mess.affairs@iiitdm.ac.in",
  "sac-mess@iiitdm.ac.in",
  "mess.sac@iiitdm.ac.in",
  "sac@iiitdm.ac.in",
  "hostel-affairs@iiitdm.ac.in",
  "mess-committee@iiitdm.ac.in"
];

const SAC_NAME_KEYWORDS = [
  "sac - mess affairs",
  "sac mess affairs",
  "sac mess",
  "mess affairs",
  "student affairs committee",
  "mess committee",
  "hostel affairs"
];

/**
 * Extract an email address from a string like "SAC Mess Affairs <sac-mess@iiitdm.ac.in>"
 */
function extractEmailAddress(str) {
  if (!str) return "";
  const match = str.match(/<([^>]+)>/) || str.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1].toLowerCase().trim() : str.toLowerCase().trim();
}

/**
 * Strips HTML tags and unescapes common entities if only HTML body is provided
 */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Cleans email body by stripping quotation threads, disclaimers, and footers
 */
function cleanEmailBody(bodyText) {
  if (!bodyText) return "";

  let cleaned = bodyText;

  // Remove forwarded / reply headers
  cleaned = cleaned.replace(/---------- Forwarded message ---------[\s\S]*/gi, "");
  cleaned = cleaned.replace(/On [A-Za-z]{3}, [A-Za-z]{3} \d{1,2}, \d{4}[\s\S]*wrote:/gi, "");
  cleaned = cleaned.replace(/From:[\s\S]*?Sent:[\s\S]*?Subject:[\s\S]*?\n/gi, "");

  // Remove common university / mail disclaimers
  cleaned = cleaned.replace(/Disclaimer:[\s\S]*?strictly prohibited\.?/gi, "");
  cleaned = cleaned.replace(/This email and any files transmitted with it are confidential[\s\S]*$/gi, "");
  cleaned = cleaned.replace(/You received this message because you are subscribed to[\s\S]*$/gi, "");
  cleaned = cleaned.replace(/To unsubscribe from this group[\s\S]*$/gi, "");
  cleaned = cleaned.replace(/Sent from my (iPhone|Android|Galaxy|iPad|Mail for Windows)[\s\S]*$/gi, "");

  // Remove trailing signatures
  cleaned = cleaned.replace(/--\s*\n[\s\S]*$/gi, "");
  cleaned = cleaned.replace(/(Thanks|Regards|Warm Regards|Best Wishes),?\s*\n+(SAC|Mess|Mess Affairs|Students Affairs)[\s\S]*$/gi, "");

  // Normalize excessive spacing
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  // If excessively long, truncate cleanly
  if (cleaned.length > 1200) {
    cleaned = cleaned.slice(0, 1190) + "...";
  }

  return cleaned;
}

/**
 * Cleans the email subject line (removes Re:, Fwd:, mailing list brackets)
 */
function cleanSubjectLine(subject) {
  if (!subject) return "Mess Update from SAC";
  return subject
    .replace(/^(re|fwd|fw):\s*/i, "")
    .replace(/^\[(students|all-students|all-ug|all-pg|hostel)\]\s*/i, "")
    .replace(/^\[SAC[^\]]*\]\s*/i, "")
    .trim();
}

/**
 * Analyzes subject and body to detect category, priority, and banner eligibility
 */
function analyzeCategoryAndPriority(subject, body) {
  const combined = `${subject} ${body}`.toLowerCase();

  // Menu substitution / Special feast detection keywords
  const menuKeywords = [
    "menu change", "menu substitution", "special dinner", "grand feast",
    "special lunch", "biryani", "chicken", "paneer", "sweet", "ice cream",
    "instead of", "substitution for", "replacement item", "diwali feast",
    "onam feast", "pongal feast", "served today"
  ];
  const isMenuSubstitution = menuKeywords.some(keyword => combined.includes(keyword));

  // Emergency / Urgent alert detection keywords
  const emergencyKeywords = [
    "emergency", "urgent", "immediate", "water shortage", "water pipeline",
    "power interruption", "temporary closure", "closed until", "closure of mess",
    "suspended", "cancelled today", "due to maintenance"
  ];
  const hasEmergencyKeywords = emergencyKeywords.some(keyword => combined.includes(keyword));

  if (isMenuSubstitution) {
    return {
      category: "menu_substitution",
      priority: hasEmergencyKeywords ? "urgent" : "high",
      isBanner: true,
      bannerHours: 24
    };
  }

  if (hasEmergencyKeywords) {
    return {
      category: "emergency",
      priority: "urgent",
      isBanner: true,
      bannerHours: 48
    };
  }

  // Standard SAC update
  return {
    category: "sac_update",
    priority: "normal",
    isBanner: true,
    bannerHours: 72
  };
}

/**
 * Normalizes different incoming webhook formats (SendGrid, Postmark, generic JSON)
 */
function normalizePayload(payload = {}) {
  const senderRaw = payload.from || payload.From || payload.sender || payload["sender-email"] || "";
  const senderEmail = extractEmailAddress(senderRaw);
  const senderName = payload.from_name || (senderRaw.includes("<") ? senderRaw.split("<")[0].trim().replace(/['"]/g, "") : "");

  const subject = payload.subject || payload.Subject || payload.title || "";
  
  // Body could be plain text or HTML
  let bodyText = payload.text || payload.TextBody || payload.body || payload.message || "";
  if (!bodyText && (payload.html || payload.HtmlBody)) {
    bodyText = stripHtml(payload.html || payload.HtmlBody);
  }

  const date = payload.date || payload.Date || payload.timestamp || new Date();
  const secret = payload.secret || payload.token || "";

  return {
    senderRaw,
    senderEmail,
    senderName,
    subject,
    bodyText,
    date,
    secret
  };
}

/**
 * Validates whether the sender is authorized as official SAC Mess Affairs
 */
function isAuthorizedSender(senderEmail, senderRaw, senderName) {
  // Allow wildcard authorization via environment variable if configured
  if (process.env.AUTHORIZED_EMAIL_SENDERS) {
    const customAllowed = process.env.AUTHORIZED_EMAIL_SENDERS.split(",").map(s => s.trim().toLowerCase());
    if (customAllowed.includes(senderEmail.toLowerCase())) {
      return true;
    }
  }

  // Check known SAC email addresses
  if (SAC_SENDER_PATTERNS.includes(senderEmail.toLowerCase())) {
    return true;
  }

  // Check official college domain with SAC / Mess in the handle or display name
  const isCollegeDomain = senderEmail.endsWith("@iiitdm.ac.in");
  const rawLower = (senderRaw || "").toLowerCase();
  const nameLower = (senderName || "").toLowerCase();

  const hasSacKeyword = SAC_NAME_KEYWORDS.some(kw => 
    rawLower.includes(kw) || nameLower.includes(kw) || senderEmail.includes("sac") || senderEmail.includes("mess")
  );

  return isCollegeDomain && hasSacKeyword;
}

/**
 * Handles incoming webhook POST request from SendGrid, Postmark, or custom relay
 * 
 * @param {Object} rawPayload - Incoming body
 * @param {Object} query - Express req.query
 * @param {Object} headers - Express req.headers
 * @returns {Promise<Object>} Created notification or status object
 */
async function handleInboundSacEmailWebhook(rawPayload, query = {}, headers = {}) {
  try {
    const normalized = normalizePayload(rawPayload);

    // Verify webhook secret if configured in environment
    const configuredSecret = process.env.SAC_WEBHOOK_SECRET;
    if (configuredSecret) {
      const providedSecret = headers["x-webhook-secret"] || query.secret || normalized.secret;
      if (providedSecret !== configuredSecret) {
        const error = new Error("Unauthorized webhook call: Invalid webhook secret token");
        error.statusCode = 401;
        throw error;
      }
    }

    // Verify sender authorization
    const isAuthorized = isAuthorizedSender(
      normalized.senderEmail,
      normalized.senderRaw,
      normalized.senderName
    );

    if (!isAuthorized) {
      console.warn(`[SAC Email Parser] Ignored email from unauthorized sender: "${normalized.senderRaw}"`);
      return {
        status: "ignored",
        reason: "Sender is not recognized as official SAC Mess Affairs (@iiitdm.ac.in)",
        sender: normalized.senderEmail
      };
    }

    // Clean subject and body
    const cleanTitle = cleanSubjectLine(normalized.subject);
    const cleanBody = cleanEmailBody(normalized.bodyText) || "An official update regarding hostel mess services was announced.";

    // Classify category and priority
    const { category, priority, isBanner, bannerHours } = analyzeCategoryAndPriority(cleanTitle, cleanBody);

    const bannerActiveUntil = isBanner
      ? new Date(Date.now() + bannerHours * 60 * 60 * 1000)
      : null;

    // Create Notification document
    const notification = new Notification({
      title: cleanTitle,
      message: cleanBody,
      recipientType: "students",
      category,
      source: "sac_email",
      priority,
      isBanner,
      bannerActiveUntil,
      senderEmail: normalized.senderEmail,
      rawEmailSubject: normalized.subject,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days retention
    });

    await notification.save();
    console.log(`[SAC Email Parser] Successfully published ${category} announcement: "${cleanTitle}"`);

    return {
      status: "success",
      notification
    };
  } catch (error) {
    console.error("[SAC Email Parser] Error processing inbound email webhook:", error);
    throw error;
  }
}

/**
 * Developer helper to simulate receiving a SAC Mess email (for testing & demo purposes)
 */
async function simulateSacEmail({
  subject = "Urgent: Menu change for Dinner today",
  message = "Please note that Paneer Butter Masala will be served instead of Mixed Veg Korma for Dinner today in Jasmine Mess due to supply delivery changes.",
  from = "SAC Mess Affairs <mess.affairs@iiitdm.ac.in>",
  priorityOverride = null
} = {}) {
  const result = await handleInboundSacEmailWebhook({
    from,
    subject,
    text: message,
    date: new Date().toISOString()
  });

  if (result.status === "success" && priorityOverride) {
    result.notification.priority = priorityOverride;
    await result.notification.save();
  }

  return result;
}

module.exports = {
  handleInboundSacEmailWebhook,
  simulateSacEmail,
  isAuthorizedSender,
  cleanEmailBody,
  cleanSubjectLine,
  analyzeCategoryAndPriority,
  normalizePayload
};
