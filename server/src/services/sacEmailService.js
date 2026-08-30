/**
 * FUTURE FEATURE: Automated "SAC - Mess Affairs" Email Announcement Parser
 * 
 * This service module is designed for future automated integration with Gmail API
 * and Inbound Email Webhooks to automatically display official SAC mess updates 
 * (such as temporary 1-day menu changes, mess closures, maintenance notices) on MealSync.
 */

const Notification = require("../models/Notification");

/**
 * Option 1: Inbound Webhook Parser (e.g. SendGrid Inbound Parse / Postmark Inbound Webhook)
 * Processes incoming webhook POST payloads forwarded from @iiitdm.ac.in emails.
 * 
 * @param {Object} emailPayload - Parsed email object containing subject, text, from, date
 */
async function handleInboundSacEmailWebhook(emailPayload) {
  try {
    const { subject, text, from, date } = emailPayload;

    // Filter to ensure email originates from SAC - Mess Affairs
    if (!from || (!from.toLowerCase().includes("sac") && !from.toLowerCase().includes("mess"))) {
      console.log("Ignored non-SAC email notification:", from);
      return null;
    }

    // Format new notification record
    const newNotification = new Notification({
      title: subject || "Mess Update from SAC",
      message: text || "An update regarding hostel mess services was received.",
      recipientType: "students",
      category: "sac_update",
      createdAt: date ? new Date(date) : new Date()
    });

    await newNotification.save();
    console.log("Successfully created SAC email announcement:", newNotification.title);
    return newNotification;
  } catch (error) {
    console.error("Error processing inbound SAC email webhook:", error);
    throw error;
  }
}

/**
 * Option 2: Gmail API Integration (Google Cloud OAuth2 / Pub/Sub Push)
 * Polls or listens to Google Cloud Pub/Sub push events for new messages matching query `from:sac-mess@iiitdm.ac.in`.
 * 
 * @param {Object} gmailClient - Authenticated Google API Gmail client instance
 */
async function pollSacEmailsViaGmailApi(gmailClient) {
  // To be implemented: Fetch latest unread messages from SAC-Mess Affairs query
  // Ref: https://developers.google.com/gmail/api/guides/push
  console.log("Gmail API service stub ready for credential configuration.");
  return [];
}

module.exports = {
  handleInboundSacEmailWebhook,
  pollSacEmailsViaGmailApi
};
