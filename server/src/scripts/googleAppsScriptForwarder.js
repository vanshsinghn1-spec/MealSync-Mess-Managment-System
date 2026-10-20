/**
 * MealSync - Google Apps Script Automated Email Webhook Relay
 * 
 * Instructions:
 * 1. Open https://script.google.com/ while logged into your @iiitdm.ac.in Google account.
 * 2. Click "New project".
 * 3. Replace Code.gs with this exact script.
 * 4. In the left sidebar, click "Triggers" (alarm clock icon) > "Add Trigger":
 *    - Function to run: checkMessAffairsEmails
 *    - Event source: Time-driven
 *    - Type of based trigger: Minutes timer
 *    - Select minute interval: Every 5 minutes
 * 5. Click "Save" and authorize Google permissions when prompted.
 * 
 * Once set up, this script runs 24/7 in Google's cloud with ZERO Google Cloud Platform (GCP)
 * or admin permissions needed. Any email from mess.affairs@iiitdm.ac.in is ingested in real time.
 */

const MEALSYNC_WEBHOOK_URL = "https://mealsync-mess-managment-system.onrender.com/api/notifications/inbound-email";

// Optional: If you set SAC_WEBHOOK_SECRET in server/.env, put it here
const WEBHOOK_SECRET = ""; 

function checkMessAffairsEmails() {
  // Search for unread emails from official mess affairs address
  const query = 'from:mess.affairs@iiitdm.ac.in label:unread';
  const threads = GmailApp.search(query, 0, 5);

  if (threads.length === 0) {
    Logger.log("No new unread emails from mess.affairs@iiitdm.ac.in.");
    return;
  }

  Logger.log(`Found ${threads.length} unread thread(s). Processing...`);

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();

    for (let j = 0; j < messages.length; j++) {
      const msg = messages[j];

      if (msg.isUnread()) {
        const payload = {
          from: msg.getFrom(),
          to: msg.getTo(),
          subject: msg.getSubject(),
          text: msg.getPlainBody(),
          html: msg.getBody(),
          date: msg.getDate().toISOString(),
          secret: WEBHOOK_SECRET
        };

        const options = {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };

        try {
          const response = UrlFetchApp.fetch(MEALSYNC_WEBHOOK_URL, options);
          Logger.log(`Webhook response (${response.getResponseCode()}): ${response.getContentText()}`);

          // Mark message read so it is not processed on subsequent trigger runs
          msg.markRead();
        } catch (error) {
          Logger.log(`Error delivering email to MealSync webhook: ${error.toString()}`);
        }
      }
    }
  }
}
