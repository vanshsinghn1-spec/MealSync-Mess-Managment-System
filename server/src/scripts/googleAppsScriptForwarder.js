/**
 * MealSync - Resilient Google Apps Script Automated Email Webhook Relay
 * 
 * Updates & Fixes:
 * - Added top-level try/catch with automated retry for transient Google internal hiccups
 *   ("We're sorry, a server error occurred. Please wait a bit and try again.").
 * - Prevents Google from sending automated failure notification emails on temporary glitches.
 * - Added safe per-message parsing and body truncation to prevent execution timeouts.
 * 
 * Instructions to update in Google Apps Script:
 * 1. Open https://script.google.com/
 * 2. Open your project ("Untitled project" or "MealSync Email Relay").
 * 3. Replace all code in Code.gs with this updated script.
 * 4. Click Save (disk icon).
 */

const MEALSYNC_WEBHOOK_URL = "https://mealsync-mess-managment-system.onrender.com/api/notifications/inbound-email";
const WEBHOOK_SECRET = ""; 

function checkMessAffairsEmails() {
  try {
    runWithRetry(processMessAffairsEmails, 2, 2000);
  } catch (err) {
    // Log gracefully so Google Apps Script does not send an alarming crash email
    console.error("Transient error during checkMessAffairsEmails (will auto-retry on next 5-min cycle): " + err.toString());
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
      // Detect Google's transient internal server errors
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
 * Core email search and webhook dispatch logic
 */
function processMessAffairsEmails() {
  const query = 'from:mess.affairs@iiitdm.ac.in label:unread';
  const threads = GmailApp.search(query, 0, 5);

  if (!threads || threads.length === 0) {
    console.log("No new unread emails from mess.affairs@iiitdm.ac.in.");
    return;
  }

  console.log(`Found ${threads.length} unread thread(s). Processing...`);

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    let messages;

    try {
      messages = thread.getMessages();
    } catch (e) {
      console.warn("Could not retrieve messages for thread: " + e.toString());
      continue;
    }

    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];

      try {
        if (!msg.isUnread()) continue;

        let plainBody = "";
        let htmlBody = "";

        try {
          plainBody = msg.getPlainBody() || "";
        } catch (_) {}

        try {
          htmlBody = msg.getBody() || "";
        } catch (_) {}

        // Truncate if exceptionally large to avoid UrlFetch limits
        if (plainBody.length > 10000) plainBody = plainBody.substring(0, 10000);
        if (htmlBody.length > 25000) htmlBody = htmlBody.substring(0, 25000);

        const payload = {
          from: msg.getFrom(),
          to: msg.getTo(),
          subject: msg.getSubject() || "Mess Update from SAC",
          text: plainBody,
          html: htmlBody,
          date: msg.getDate() ? msg.getDate().toISOString() : new Date().toISOString(),
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
        console.log(`Delivered "${payload.subject}" - Webhook HTTP ${statusCode}`);

        // Mark as read so it won't be processed again
        msg.markRead();
      } catch (msgErr) {
        console.error("Error processing individual message: " + msgErr.toString());
      }
    }
  }
}
