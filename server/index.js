const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Enhanced error handlers with more detail
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
});

const app = express();

// CORS configuration with specific origin
app.use(
  cors({
    // Update to allow both development and production origins
    origin: [
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5500/project/frontend/index.html",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Load credentials with error handling
let credentials;
try {
  credentials = JSON.parse(
    fs.readFileSync(path.join(__dirname, "credentials.json"))
  );
  console.log("Credentials loaded successfully");
} catch (err) {
  console.error("Error loading credentials:", err);
  process.exit(1); // Exit if credentials can't be loaded
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const SPREADSHEET_ID = "1fcjHfMloNphoL648p9vlbTdMBr5xvplQELy-jS_9pz0";
const RANGE = "Sheet1!A:F";

app.post("/api/submit", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { name, email, whatsapp, cnic, city } = req.body;

    if (!name || !email || !whatsapp || !cnic || !city) {
      throw new Error("Missing required fields");
    }

    const sheets = google.sheets({ version: "v4", auth });

    // Get existing codes to generate next code
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    // Fix code generation logic
    let nextNumber = 1;
    if (getRes.data.values && getRes.data.values.length > 0) {
      const lastRow = getRes.data.values[getRes.data.values.length - 1];
      const lastCode = lastRow[5] || "SA00"; // Column F is index 5
      const lastNumber = parseInt(lastCode.replace("SA", "")) || 0;
      nextNumber = lastNumber + 1;
    }

    const newCode = "SA" + nextNumber.toString().padStart(2, "0");

    // Append new row with code
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:F", // Explicitly set range
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [[name, email, whatsapp, cnic, city, newCode]],
      },
    });

    console.log(`Data written successfully with code: ${newCode}`);
    res.status(200).json({
      message: "Success",
      code: newCode,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server with error handling
const server = app
  .listen(3000, () => {
    console.log("Server running on port 3000");
  })
  .on("error", (err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
