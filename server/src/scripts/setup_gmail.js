/**
 * CLI helper to connect Gmail API for SAC Mess Affairs emails
 * 
 * Usage:
 *   node src/scripts/setup_gmail.js
 */

const readline = require('readline');
const { getAuthUrl, exchangeCodeForTokens, pollSacEmailsFromGmail } = require('../services/gmailPollingService');
const connectDB = require('../config/db');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('====================================================');
  console.log(' MealSync Gmail API Integration (mess.affairs)      ');
  console.log('====================================================\n');

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (refreshToken) {
    console.log('✓ Found existing GMAIL_REFRESH_TOKEN in server/.env.');
    console.log('Connecting to database and polling Gmail now...');
    await connectDB();
    const result = await pollSacEmailsFromGmail();
    console.log('\nPolling Result:', result);
    process.exit(0);
  }

  if (!clientId || !clientSecret) {
    console.log('To connect Gmail API, you need Google Cloud OAuth credentials:');
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Create a project and enable "Gmail API".');
    console.log('3. Under "APIs & Services" > "Credentials", create "OAuth client ID" (Desktop app or Web app).');
    console.log('4. Add redirect URI: http://localhost:5000/api/notifications/gmail-callback (or https://developers.google.com/oauthplayground)');
    console.log('5. Add the following to your server/.env:');
    console.log('\n   GMAIL_CLIENT_ID=your_client_id_here');
    console.log('   GMAIL_CLIENT_SECRET=your_client_secret_here\n');
    process.exit(1);
  }

  // Generate OAuth URL
  const authUrl = getAuthUrl();
  console.log('Step 1: Open the following URL in your browser:\n');
  console.log(authUrl);
  console.log('\nStep 2: Sign in with your @iiitdm.ac.in account and grant read-only access.');
  console.log('Step 3: Copy the authorization code from the callback page.\n');

  const code = await ask('Paste the authorization code here: ');

  if (!code || !code.trim()) {
    console.log('No code provided. Aborted.');
    process.exit(1);
  }

  console.log('\nExchanging code for tokens...');
  const tokens = await exchangeCodeForTokens(code.trim());

  console.log('\n✓ Successfully obtained tokens!');
  console.log('Add the refresh token to your server/.env file:\n');
  console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);

  process.env.GMAIL_REFRESH_TOKEN = tokens.refresh_token;

  console.log('Testing live poll from mess.affairs@iiitdm.ac.in...');
  await connectDB();
  const pollRes = await pollSacEmailsFromGmail();
  console.log('Poll Result:', pollRes);

  process.exit(0);
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
