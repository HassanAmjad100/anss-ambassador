const { google } = require("googleapis");
const credentials = require("./credentials.json");

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
