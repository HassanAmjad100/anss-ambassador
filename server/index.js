const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

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
      "https://anss-ambassador.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Test route to check environment
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    environment: process.env.NODE_ENV || "development",
    hasCredentials: !!credentials,
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString()
  });
});

// Load credentials from environment variables for Vercel deployment
let credentials;
try {
  if (process.env.GOOGLE_CREDENTIALS) {
    // For Vercel deployment - use environment variable
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log("Credentials loaded from environment variables");
  } else {
    // For local development - try to read from file
    const fs = require("fs");
    const path = require("path");
    credentials = JSON.parse(
      fs.readFileSync(path.join(__dirname, "credentials.json"))
    );
    console.log("Credentials loaded from local file");
  }
} catch (err) {
  console.error("Error loading credentials:", err);
  // Don't exit on Vercel, just log the error
  if (process.env.VERCEL) {
    console.error("Running on Vercel but no credentials found");
  } else {
    process.exit(1);
  }
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "1fcjHfMloNphoL648p9vlbTdMBr5xvplQELy-jS_9pz0";
const RANGE = "Sheet1!A:F";

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Function to send welcome email
async function sendWelcomeEmail(email, name, referralCode) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to ANSS Ambassador Program! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(90deg, #bfa14a 0%, #d4aa62 60%, #bfa14a 100%); padding: 30px; text-align: center; border-radius: 15px;">
            <h1 style="color: #0c0c0c; margin: 0;">🎉 Welcome to ANSS Ambassador Program!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #d4aa62;">Hello ${name}!</h2>
            <p>Thank you for joining the ANSS Ambassador Program! We're excited to have you on board.</p>
            
            <div style="background: #fff; padding: 20px; border-radius: 10px; border-left: 5px solid #d4aa62; margin: 20px 0;">
              <h3 style="color: #d4aa62; margin-top: 0;">Your Referral Code: <strong>${referralCode}</strong></h3>
              <p>Use this code when referring friends and family to earn PKR 200,000 per successful sale!</p>
            </div>
            
            <h3 style="color: #d4aa62;">What's Next?</h3>
            <ul style="color: #333;">
              <li>Share your referral code with your network</li>
              <li>Post on social media about the program</li>
              <li>Earn rewards for successful referrals</li>
            </ul>
            
            <p style="margin-top: 30px; color: #666;">
              Our team will contact you soon with more details about the program.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #d4aa62; font-weight: bold;">Thank you for being part of our program! 🚀</p>
            </div>
          </div>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    return false;
  }
}

app.post("/api/submit", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { name, email, whatsapp, cnic, city } = req.body;

    if (!name || !email || !whatsapp || !cnic || !city) {
      throw new Error("Missing required fields");
    }

    // Check if credentials are available
    if (!credentials) {
      throw new Error("Google API credentials not configured");
    }

    const sheets = google.sheets({ version: "v4", auth });

    // Check if email already exists to prevent duplicates
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    if (existingData.data.values) {
      const emailExists = existingData.data.values.some(row => row[1] === email); // Column B (index 1) is email
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: "Email already registered. Please use a different email address."
        });
      }
    }

    // Get existing codes to generate next code
    let nextNumber = 1;
    if (existingData.data.values && existingData.data.values.length > 0) {
      const lastRow = existingData.data.values[existingData.data.values.length - 1];
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

    console.log("Data appended successfully with code:", newCode);

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(email, name, newCode).catch(err => {
      console.error("Email sending failed:", err);
    });

    res.json({
      success: true,
      message: "Form submitted successfully",
      referralCode: newCode,
    });
  } catch (error) {
    console.error("Error in /api/submit:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  // Only start server if not on Vercel
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
