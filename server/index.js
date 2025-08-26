require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Email configuration with your existing credentials
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'anssgroup1@gmail.com',
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Check if email credentials are properly configured
if (!process.env.EMAIL_PASS) {
  console.warn('⚠️  EMAIL_PASS not found in environment variables.');
  console.warn('   Email functionality will be disabled.');
  console.warn('   Please set up Gmail App Password as described in SETUP.md');
}

// Add this to verify email configuration on startup
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Enhanced error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
});

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ['http://127.0.0.1:5500', 'https://anss-ambassador.vercel.app', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Google Sheets Setup
let credentials;
try {
  if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('Using Google credentials from environment variable');
  } else {
    try {
      credentials = require('../credentials.json');
      console.log('Using Google credentials from credentials.json file');
    } catch (fileErr) {
      console.warn('No credentials.json file found. Google Sheets functionality will be disabled.');
      console.warn('Please set up Google API credentials as described in SETUP.md');
    }
  }
} catch (err) {
  console.error('Error loading Google credentials:', err);
  console.warn('Google Sheets functionality will be disabled. Please check your credentials setup.');
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1fcjHfMloNphoL648p9vlbTdMBr5xvplQELy-jS_9pz0';
const RANGE = 'Sheet1!A:F';

// Verify email transporter
emailTransporter.verify(function (error, success) {
  if (error) {
    console.error('Email configuration error:', {
      error: error.message,
      code: error.code,
      command: error.command,
    });
  } else {
    console.log('Server is ready to send emails');
  }
});

// Function to send welcome email
async function sendWelcomeEmail(email, name, referralCode) {
  try {
    console.log('Attempting to send email to:', email);
    console.log('Using email credentials:', {
      user: process.env.EMAIL_USER || 'anssgroup1@gmail.com',
      usingDefault: !process.env.EMAIL_USER,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'anssgroup1@gmail.com',
      to: email,
      subject: "🎉 You're Officially an ANSS Group Ambassador!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(90deg, #bfa14a 0%, #d4aa62 60%, #bfa14a 100%); padding: 30px; text-align: center; border-radius: 15px;">
            <h1 style="color: #0c0c0c; margin: 0;">🎉 You're Officially an ANSS Group Ambassador!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #d4aa62;">Hello ${name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              <strong>Great news — you're in!</strong> Your registration for the ANSS Group Ambassador Program is confirmed.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              From today, you have the power to earn <strong>Rs. 200,000</strong> on every successful property sale you refer. 
              <strong>No limits. No catch.</strong> Just big rewards for spreading the word.
            </p>
            
            <div style="background: #fff; padding: 25px; border-radius: 15px; border-left: 5px solid #d4aa62; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #d4aa62; margin-top: 0; font-size: 18px;">🎯 Your Promo Code: <strong style="font-size: 22px; color: #0c0c0c;">${referralCode}</strong></h3>
              <p style="margin: 10px 0; color: #666; font-size: 14px;">
                Use this code when referring friends and family to earn Rs. 200,000 per successful sale!
              </p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Our team will be sharing your next steps shortly so you can start earning right away. 
              <strong>Get ready — this is where opportunity meets action!</strong>
            </p>
            
            <div style="background: linear-gradient(90deg, #bfa14a 0%, #d4aa62 60%, #bfa14a 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
              <p style="color: #0c0c0c; font-weight: bold; font-size: 18px; margin: 0;">
                Welcome to the team — let's make big moves together! 🚀
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Best regards,</strong><br>
                Team ANSS Group
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      recipient: email,
    });
    return true;
  } catch (error) {
    console.error('Detailed email sending error:', {
      errorMessage: error.message,
      errorCode: error.code,
      errorCommand: error.command,
      recipient: email,
      stack: error.stack,
    });
    return false;
  }
}

app.post('/api/submit', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { name, email, whatsapp, cnic, city } = req.body;

    if (!name || !email || !whatsapp || !cnic || !city) {
      throw new Error('Missing required fields');
    }

    // Check if credentials are available
    if (!credentials) {
      throw new Error('Google API credentials not configured');
    }

    const sheets = google.sheets({ version: 'v4', auth });

    // Check if email already exists to prevent duplicates
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    if (existingData.data.values) {
      const emailExists = existingData.data.values.some((row) => row[1] === email); // Column B (index 1) is email
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered. Please use a different email address.',
        });
      }
    }

    // Get existing codes to generate next code
    let nextNumber = 1;
    if (existingData.data.values && existingData.data.values.length > 0) {
      const lastRow = existingData.data.values[existingData.data.values.length - 1];
      const lastCode = lastRow[5] || 'SA00'; // Column F (index 5) is lastCode
      const lastNumber = parseInt(lastCode.replace('SA', '')) || 0;
      nextNumber = lastNumber + 1;
    }

    const newCode = 'SA' + nextNumber.toString().padStart(2, '0');

    // Append new row with code
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:F', // Explicitly set range
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[name, email, whatsapp, cnic, city, newCode]],
      },
    });

    console.log('Data appended successfully with code:', newCode);

    // Send welcome email (don't block response)
    try {
      const emailSent = await sendWelcomeEmail(email, name, newCode);
      if (!emailSent) {
        console.warn(`Email sending failed for ${email}, but form submission was successful`);
      }

      res.json({
        success: true,
        message: 'Form submitted successfully' + (emailSent ? ' and welcome email sent' : ' but email sending failed'),
        referralCode: newCode,
        emailStatus: emailSent ? 'sent' : 'failed',
      });
    } catch (error) {
      console.error('Error in /api/submit:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        emailStatus: 'failed',
      });
    }
  } catch (error) {
    console.error('Error in /api/submit:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Add this new test route
app.get('/api/test-email', async (req, res) => {
  try {
    const testResult = await sendWelcomeEmail('your-test-email@gmail.com', 'Test User', 'TEST01');
    res.json({
      success: testResult,
      message: testResult ? 'Test email sent successfully' : 'Email sending failed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add this new route
app.get('/api/verify-email-config', async (req, res) => {
  try {
    const config = {
      user: process.env.EMAIL_USER || 'anssgroup1@gmail.com',
      usingDefault: !process.env.EMAIL_USER,
      environment: process.env.VERCEL ? 'Vercel' : 'Development',
    };

    res.json({
      success: true,
      config,
      message: 'Email configuration loaded',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

const PORT = process.env.PORT || 3000;

// Only start server if not on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
