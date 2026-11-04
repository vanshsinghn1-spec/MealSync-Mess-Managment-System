/**
 * MealSync - Resilient Google Apps Script Automated Email Webhook Relay
 * 
 * Scope: This Semester (1st August till today)
 * 
 * Features & Capabilities:
 * - Semester Sync: Ingests all mess circulars from 1st August onwards (read or unread).
 * - 24/7 Keep-Alive: Pings Render backend every 5 minutes so menu loads in <0.5s.
 * - Idempotent Email Sync: Passes messageId so emails can be relayed without duplicates.
 * - Auto-Classification: Backend automatically tags Urgent / Menu Changes / SAC Notices.
 * 
 * Instructions to update in Google Apps Script:
 * 1. Open https://script.google.com/
 * 2. Open your project ("MealSync Email Relay").
 * 3. Replace all code in Code.gs with this script.
 * 4. Click Save (disk icon).
 * 5. (One-time Sync): Select "syncSemesterMessAffairsEmails" in the top function dropdown and click "Run".
 *    This will immediately import all semester emails (from August 1st till today, including Parotta Mela) into MealSync!
 * 6. The regular 5-minute trigger (checkMessAffairsEmails) will handle all new semester updates 24/7.
 */

const MEALSYNC_WEBHOOK_URL = "https://mealsync-mess-managment-system.onrender.com/api/notifications/inbound-email";
const WEBHOOK_SECRET = ""; 

// Semester Start: 1st August of the current academic year
const SEMESTER_YEAR = new Date().getFullYear();
const SEMESTER_START_DATE = new Date(SEMESTER_YEAR, 7, 1, 0, 0, 0); // Month 7 is August (0-indexed)
const GMAIL_SEMESTER_QUERY = "from:mess.affairs@iiitdm.ac.in after:" + SEMESTER_YEAR + "/07/31";

/**
 * 5-Minute Recurring Trigger Function
 * Keeps backend warm and checks for new semester mess announcements
 */
function checkMessAffairsEmails() {
  // 1. Keep Render backend and menu cache warm (eliminates cold starts)
  keepBackendWarm();

  // 2. Check and relay recent SAC mess affairs emails for this semester
  try {
    runWithRetry(processRecentMessAffairsEmails, 2, 2000);
  } catch (err) {
    console.error("Transient error during checkMessAffairsEmails: " + err.toString());
  }
}

/**
 * Pings the menu endpoint every 5 minutes to keep the Render free tier awake 24/7
 */
function keepBackendWarm() {
  try {
    UrlFetchApp.fetch("https://mealsync-mess-managment-system.onrender.com/api/menu/today/all", {
      muteHttpExceptions: true
    });
  } catch (e) {
    // Quietly ignore warm-up errors
  }
}

/**
 * Executes a function with automatic retry on transient Google internal errors
 */
function runWithRetry(fn, maxRetries, delayMs) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return fn();
    } catch (e) {
      const errMsg = e.toString().toLowerCase();
      const isTransient = errMsg.includes("server error") || 
                          errMsg.includes("wait a bit") || 
                          errMsg.includes("timed out") ||
                          errMsg.includes("service invoked too many times");

      if (isTransient && attempt < maxRetries) {
        console.warn(`Transient Google error on attempt ${attempt}. Retrying in ${delayMs}ms...`);
        Utilities.sleep(delayMs);
      } else {
        throw e;
      }
    }
  }
}

/**
 * Relays recent semester emails from mess.affairs@iiitdm.ac.in.
 * Checks recent threads so emails are synced even if already opened/read on mobile.
 */
function processRecentMessAffairsEmails() {
  const threads = GmailApp.search(GMAIL_SEMESTER_QUERY, 0, 10);
  if (!threads || threads.length === 0) return;

  for (let i = 0; i < threads.length; i++) {
    let messages;
    try {
      messages = threads[i].getMessages();
    } catch (e) {
      continue;
    }

    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      // Only include messages from August 1st onwards
      if (msg.getDate() && msg.getDate() < SEMESTER_START_DATE) continue;
      relayMessageToMealSync(msg);
    }
  }
}

/**
 * One-Click Semester Sync (1st August till today):
 * Ingests ALL mess affairs emails from 1st August onwards (up to 50 threads).
 * Run this function once from the Google Apps Script editor to immediately backfill
 * "Parotta Mela" and all semester announcements from latest to oldest!
 */
function syncSemesterMessAffairsEmails() {
  console.log(`Starting semester sync of mess.affairs@iiitdm.ac.in emails (from 1st August ${SEMESTER_YEAR} till today)...`);
  const threads = GmailApp.search(GMAIL_SEMESTER_QUERY, 0, 50);
  console.log(`Found ${threads.length} semester thread(s). Ingesting...`);

  let count = 0;
  for (let i = 0; i < threads.length; i++) {
    let messages = [];
    try {
      messages = threads[i].getMessages();
    } catch (e) {
      continue;
    }

    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];
      // Strictly enforce August 1st boundary
      if (msg.getDate() && msg.getDate() < SEMESTER_START_DATE) continue;

      const res = relayMessageToMealSync(msg);
      if (res) count++;
    }
  }

  console.log(`Semester sync completed. Successfully synced ${count} message(s) to MealSync.`);
}

// Alias for backwards compatibility
function syncAllMessAffairsEmails() {
  syncSemesterMessAffairsEmails();
}

/**
 * Helper to extract, format, and deliver an individual email to the MealSync webhook
 */
function relayMessageToMealSync(msg) {
  try {
    let plainBody = "";
    let htmlBody = "";

    try {
      plainBody = msg.getPlainBody() || "";
    } catch (_) {}

    try {
      htmlBody = msg.getBody() || "";
    } catch (_) {}

    if (plainBody.length > 12000) plainBody = plainBody.substring(0, 12000);
    if (htmlBody.length > 30000) htmlBody = htmlBody.substring(0, 30000);

    const payload = {
      from: msg.getFrom(),
      to: msg.getTo(),
      subject: msg.getSubject() || "Mess Update from SAC",
      text: plainBody,
      html: htmlBody,
      date: msg.getDate() ? msg.getDate().toISOString() : new Date().toISOString(),
      messageId: msg.getId(),
      secret: WEBHOOK_SECRET
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(MEALSYNC_WEBHOOK_URL, options);
    const statusCode = response.getResponseCode();
    console.log(`[${statusCode}] "${payload.subject}" (${payload.date})`);

    if (msg.isUnread()) {
      msg.markRead();
    }

    return statusCode === 200 || statusCode === 201;
  } catch (err) {
    console.error("Error relaying message: " + err.toString());
    return false;
  }
}
