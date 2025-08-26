# ANSS Ambassador Program

A referral/ambassador program management system for ANSS Group that allows people to register as ambassadors and earn commissions on property sales.

## 🚀 Live Demo

Visit: [https://anss-ambassador.vercel.app](https://anss-ambassador.vercel.app)

## 🎯 Features

- **Ambassador Registration**: Users can register with their details
- **Automatic Referral Codes**: Unique codes generated for each ambassador
- **Google Sheets Integration**: Data stored in real-time
- **Email Automation**: Welcome emails sent automatically
- **Duplicate Prevention**: Prevents duplicate email registrations
- **Professional UI**: Modern, responsive design

## 🏗️ Architecture

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: Google Sheets API
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel

## 📋 Setup Instructions

See [SETUP.md](SETUP.md) for detailed setup instructions.

## 🔧 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/HassanAmjad100/anss-ambassador.git
   cd anss-ambassador
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.template .env
   # Edit .env with your credentials
   ```

4. **Set up Google credentials**

   ```bash
   npm run setup
   ```

5. **Run locally**

   ```bash
   npm run dev
   ```

6. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## 🔑 Environment Variables

- `EMAIL_USER`: Gmail address
- `EMAIL_PASS`: Gmail App Password
- `SPREADSHEET_ID`: Google Sheets ID
- `GOOGLE_CREDENTIALS`: Google API credentials (optional)

## 📊 API Endpoints

- `POST /api/submit`: Submit ambassador registration
- `GET /api/test-email`: Test email functionality
- `GET /api/verify-email-config`: Check email configuration

## 🎨 UI Features

- Responsive design
- Professional ANSS branding
- Smooth animations
- Form validation
- Success/error handling

## 🔒 Security

- CORS protection
- Input validation
- Secure credential management
- Environment-based configuration

## 📈 Business Model

- **Commission**: Rs. 200,000 per successful property sale
- **No Limits**: Unlimited earning potential
- **Referral Tracking**: Unique codes for each ambassador

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary to ANSS Group.
