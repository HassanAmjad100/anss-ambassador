const { google } = require("googleapis");

// Load credentials from environment variables for Vercel deployment
let credentials;
try {
  if (process.env.GOOGLE_CREDENTIALS) {
    // For Vercel deployment - use environment variable
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log("Credentials loaded from environment variables in googleService");
  } else {
    // For local development - try to read from file
    credentials = require("./credentials.json");
    console.log("Credentials loaded from local file in googleService");
  }
} catch (err) {
  console.error("Error loading credentials in googleService:", err);
  throw new Error("Google API credentials not configured");
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

async function appendToSheet(values, spreadsheetId, range) {
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: { values: [values] },
  });
}

module.exports = { appendToSheet };
