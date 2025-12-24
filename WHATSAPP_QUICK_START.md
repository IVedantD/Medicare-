# WhatsApp Integration - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Get Twilio Credentials

1. Sign up at https://www.twilio.com (free trial available)
2. Go to Console → Account → API Keys & Tokens
3. Copy your **Account SID** and **Auth Token**

### Step 3: Join WhatsApp Sandbox

1. In Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Send the code to the provided WhatsApp number to join sandbox
3. Note your sandbox WhatsApp number (format: `whatsapp:+14155238886`)

### Step 4: Configure Environment

Add to `backend/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
CLINIC_NAME=MediCare Clinic
SUPPORT_PHONE=+91 XXXXX XXXXX
```

### Step 5: Start Server

```bash
npm run dev
```

### Step 6: Test

1. Register a new user with phone number: `+91 98765 43210`
2. Check WhatsApp for welcome message
3. Book an appointment
4. Check WhatsApp for confirmation

## ✅ What Works

- ✅ Registration notifications
- ✅ Appointment booking confirmations
- ✅ Appointment cancellations
- ✅ Status updates (approved/rejected)
- ✅ Automated reminders (1 hour before)
- ✅ User preference toggle

## 📱 Phone Number Format

- Indian format: `+91 XXXXX XXXXX`
- Also accepts: `91XXXXXXXXXX` or `XXXXXXXXXX` (auto-formatted)

## 🔧 Optional Settings

```env
# Enable login alerts (default: false)
ENABLE_LOGIN_WHATSAPP_ALERTS=true

# Disable appointment reminders (default: true)
ENABLE_APPOINTMENT_REMINDERS=false
```

## 🐛 Troubleshooting

**No messages received?**
- Check phone number format (must be Indian: +91)
- Verify Twilio credentials in `.env`
- Check server logs for errors
- Ensure WhatsApp notifications are enabled for user

**Service not initialized?**
- Verify all Twilio env variables are set
- Check for typos in credentials
- Restart server after adding env variables

## 📚 Full Documentation

See `backend/WHATSAPP_SETUP.md` for complete setup guide.

---

**Ready to go!** 🎉

