/**
 * Gmail API Polling Service for SAC Mess Affairs Emails
 * 
 * Directly queries Gmail API for unread or recent messages matching
 * `from:mess.affairs@iiitdm.ac.in`, decodes the MIME payload, cleans the content,
 * and publishes real-time announcements.
 */

const { google } = require('googleapis');
const Notification = require('../models/Notification');
const sacEmailService = require('./sacEmailService');

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

/**
 * Creates an OAuth2 client with configured environment variables
 */
function createOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:5000/api/notifications/gmail-callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates the Google OAuth2 authorization URL for the student or admin account
 */
function getAuthUrl() {
  const oauth2Client = createOAuth2Client();
  if (!oauth2Client) {
    throw new Error('GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be configured in server/.env');
  }

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES
  });
}

/**
 * Exchanges a one-time OAuth authorization code for tokens (including refresh_token)
 */
async function exchangeCodeForTokens(code) {
  const oauth2Client = createOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth2 client is not configured.');
  }

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Returns an authenticated Gmail API client instance
 */
function getAuthenticatedGmailClient() {
  const oauth2Client = createOAuth2Client();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!oauth2Client || !refreshToken) {
    return null;
  }

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Recursively extracts plain text and HTML from Gmail MIME parts
 */
function extractBodyFromPayload(payload) {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  if (payload.body && payload.body.data) {
    const decoded = Buffer.from(payload.body.data, 'base64url').toString('utf8');
    if (payload.mimeType === 'text/plain') {
      text += decoded;
    } else if (payload.mimeType === 'text/html') {
      html += decoded;
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const nested = extractBodyFromPayload(part);
      if (nested.text) text += '\n' + nested.text;
      if (nested.html) html += '\n' + nested.html;
    }
  }

  return { text: text.trim(), html: html.trim() };
}

/**
 * Polls Gmail API for messages matching `from:mess.affairs@iiitdm.ac.in`
 * and creates new announcements in MongoDB for unprocessed messages.
 * 
 * @param {Object} options - Polling options (e.g. maxResults, customQuery)
 * @returns {Promise<Object>} Polling execution summary
 */
async function pollSacEmailsFromGmail({ maxResults = 10, customQuery = null } = {}) {
  const gmail = getAuthenticatedGmailClient();

  if (!gmail) {
    return {
      status: 'unconfigured',
      message: 'Gmail API credentials (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN) are not set in environment.',
      authUrlAvailable: !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET)
    };
  }

  try {
    const query = customQuery || 'from:mess.affairs@iiitdm.ac.in';
    console.log(`[Gmail Poller] Querying messages with filter: "${query}"...`);

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });

    const messages = listRes.data.messages || [];
    console.log(`[Gmail Poller] Found ${messages.length} messages matching query.`);

    if (messages.length === 0) {
      return {
        status: 'success',
        newAnnouncementsCount: 0,
        message: 'No messages found from mess.affairs@iiitdm.ac.in'
      };
    }

    const processed = [];

    for (const msgRef of messages) {
      // Deduplication check: check if already ingested into MongoDB
      const exists = await Notification.findOne({ gmailMessageId: msgRef.id });
      if (exists) {
        continue;
      }

      // Fetch full message
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id,
        format: 'full'
      });

      const messageData = msgRes.data;
      const headers = messageData.payload?.headers || [];

      const getHeader = (name) => {
        const found = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
        return found ? found.value : '';
      };

      const from = getHeader('From') || 'SAC Mess Affairs <mess.affairs@iiitdm.ac.in>';
      const subject = getHeader('Subject') || 'Mess Update from SAC';
      const date = getHeader('Date') || new Date().toISOString();

      const { text, html } = extractBodyFromPayload(messageData.payload);

      // Ingest through SAC email processor
      const result = await sacEmailService.handleInboundSacEmailWebhook({
        from,
        subject,
        text,
        html,
        date
      });

      if (result.status === 'success' && result.notification) {
        // Tag with gmailMessageId to ensure idempotency
        result.notification.gmailMessageId = msgRef.id;
        await result.notification.save();
        processed.push(result.notification);
      }
    }

    return {
      status: 'success',
      newAnnouncementsCount: processed.length,
      processed: processed.map(p => ({
        id: p._id,
        title: p.title,
        category: p.category,
        priority: p.priority,
        createdAt: p.createdAt
      }))
    };
  } catch (error) {
    console.error('[Gmail Poller] Error querying Gmail API:', error);
    throw error;
  }
}

module.exports = {
  createOAuth2Client,
  getAuthUrl,
  exchangeCodeForTokens,
  pollSacEmailsFromGmail,
  extractBodyFromPayload
};
