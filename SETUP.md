# ANSS Ambassador Setup Guide

## Prerequisites

- Node.js installed
- Gmail account with 2-factor authentication enabled
- Google Cloud Project with Google Sheets API enabled

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Google Sheets Configuration
SPREADSHEET_ID=1fcjHfMloNphoL648p9vlbTdMBr5xvplQELy-jS_9pz0

# Google API Credentials (optional - if using credentials.json file)
# GOOGLE_CREDENTIALS={"type":"service_account",...}

# Server Configuration
PORT=3000
```

### 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-factor authentication if not already enabled
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Use this password in your `EMAIL_PASS` environment variable

### 3. Google Sheets API Setup

You have two options:

#### Option A: Using credentials.json file (Recommended for development)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account
5. Download the JSON credentials file
6. Save it as `credentials.json` in the `server/` directory

#### Option B: Using environment variable (Recommended for production)

1. Follow steps 1-4 from Option A
2. Copy the entire JSON content from the credentials file
3. Add it as a single line in your `.env` file:
   ```env
   GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...",...}
   ```

### 4. Google Sheets Setup

1. Create a Google Sheet or use the existing one
2. Share the sheet with your service account email (from credentials)
3. Give it Editor permissions
4. Copy the spreadsheet ID from the URL and update `SPREADSHEET_ID` in `.env`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

```bash
npm run dev
```

## Troubleshooting

### Email Issues

- Ensure 2-factor authentication is enabled on your Gmail account
- Use an App Password, not your regular Gmail password
- Check that `EMAIL_USER` and `EMAIL_PASS` are correctly set

### Google Sheets Issues

- Verify the service account has access to the spreadsheet
- Check that the Google Sheets API is enabled
- Ensure credentials are properly formatted

### Common Errors

- `MODULE_NOT_FOUND: credentials.json` - Create the credentials file or use environment variable
- `EAUTH: Missing credentials` - Check email configuration in `.env`
- `403 Forbidden` - Verify spreadsheet sharing permissions
