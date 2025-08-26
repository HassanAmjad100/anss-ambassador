#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('🚀 ANSS Ambassador Setup Wizard\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('\n📧 Email Configuration:');
    const emailUser = (await question('Gmail address (default: anssgroup1@gmail.com): ')) || 'anssgroup1@gmail.com';
    const emailPass = await question('Gmail App Password (required): ');

    if (!emailPass) {
      console.log('❌ Gmail App Password is required for email functionality.');
      console.log('   Please set up 2-factor authentication and generate an App Password.');
      rl.close();
      return;
    }

    console.log('\n📊 Google Sheets Configuration:');
    const spreadsheetId =
      (await question('Spreadsheet ID (default: 1fcjHfMloNphoL648p9vlbTdMBr5xvplQELy-jS_9pz0): ')) || '1fcjHfMloNphoL648p9vlbTdMBr5xvplQELy-jS_9pz0';

    console.log('\n🔑 Google API Credentials:');
    console.log('   You can either:');
    console.log('   1. Create a credentials.json file in the server/ directory');
    console.log('   2. Or provide the JSON credentials as an environment variable');
    const useEnvCreds = await question('   Use environment variable for credentials? (y/N): ');

    let googleCreds = '';
    if (useEnvCreds.toLowerCase() === 'y') {
      console.log('\n   Please paste your Google service account JSON credentials:');
      googleCreds = await question('   (Press Enter when done): ');
    }

    // Create .env content
    const envContent = `# Email Configuration
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}

# Google Sheets Configuration
SPREADSHEET_ID=${spreadsheetId}

# Google API Credentials (optional - if using credentials.json file)
${googleCreds ? `GOOGLE_CREDENTIALS=${googleCreds}` : '# GOOGLE_CREDENTIALS={"type":"service_account",...}'}

# Server Configuration
PORT=3000
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ .env file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. If you chose to use credentials.json, create the file in server/ directory');
    console.log('   2. Make sure your Google Sheet is shared with your service account');
    console.log('   3. Run: npm run dev');
    console.log('\n📖 For detailed instructions, see SETUP.md');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();
