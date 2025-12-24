# WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp Business API integration using Twilio for the MediCare application.

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com)
2. A WhatsApp Business Account (or use Twilio's sandbox for testing)
3. Node.js backend with the required dependencies installed

## Step 1: Install Dependencies

The required packages are already added to `package.json`. Install them:

```bash
cd backend
npm install
```

This will install:
- `twilio` - Twilio SDK for WhatsApp API
- `node-cron` - For scheduling appointment reminders

## Step 2: Create Twilio Account

1. Go to https://www.twilio.com and sign up for a free account
2. Verify your email and phone number
3. Navigate to the Twilio Console Dashboard

## Step 3: Get Twilio Credentials

1. In the Twilio Console, go to **Account** → **API Keys & Tokens**
2. Copy your **Account SID** and **Auth Token**
3. Save these securely - you'll need them for the `.env` file

## Step 4: Set Up WhatsApp Sandbox (For Testing)

For development and testing, you can use Twilio's WhatsApp Sandbox:

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the sandbox by sending a code to Twilio's WhatsApp number
3. Once joined, you'll receive a sandbox WhatsApp number (format: `whatsapp:+14155238886`)

**Note:** In production, you'll need to apply for a WhatsApp Business API account through Twilio.

## Step 5: Configure Environment Variables

Add the following variables to your `.env` file in the `backend` directory:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Optional: WhatsApp Settings
ENABLE_LOGIN_WHATSAPP_ALERTS=false
ENABLE_APPOINTMENT_REMINDERS=true

# Optional: Clinic Information (used in messages)
CLINIC_NAME=MediCare Clinic
SUPPORT_PHONE=+91 XXXXX XXXXX
```

### Environment Variables Explained

- **TWILIO_ACCOUNT_SID**: Your Twilio Account SID (found in Twilio Console)
- **TWILIO_AUTH_TOKEN**: Your Twilio Auth Token (found in Twilio Console)
- **TWILIO_WHATSAPP_FROM**: Your WhatsApp sender number (sandbox number for testing)
- **ENABLE_LOGIN_WHATSAPP_ALERTS**: Set to `true` to send login alerts (default: `false`)
- **ENABLE_APPOINTMENT_REMINDERS**: Set to `false` to disable appointment reminders (default: `true`)
- **CLINIC_NAME**: Name of your clinic (used in WhatsApp messages)
- **SUPPORT_PHONE**: Support phone number (used in WhatsApp messages)

## Step 6: Test the Integration

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Register a new user with a valid Indian phone number (format: `+91 XXXXX XXXXX`)

3. Check the server logs for WhatsApp service initialization:
   ```
   [WhatsApp] ✅ Twilio client initialized successfully
   [WhatsApp] 📤 Sending message to whatsapp:+91XXXXXXXXXX...
   [WhatsApp] ✅ Message sent successfully. SID: SM...
   ```

4. You should receive a WhatsApp message on the registered phone number

## Step 7: Production Setup

For production, you need to:

1. **Apply for WhatsApp Business API**:
   - Go to Twilio Console → **Messaging** → **WhatsApp**
   - Complete the WhatsApp Business API application
   - Wait for approval (can take a few days to weeks)

2. **Get Production WhatsApp Number**:
   - Once approved, you'll receive a production WhatsApp number
   - Update `TWILIO_WHATSAPP_FROM` in your production `.env` file

3. **Set Up Message Templates**:
   - WhatsApp Business API requires pre-approved message templates
   - The current implementation uses free-form messages (works in sandbox)
   - For production, you may need to create templates in Twilio Console

## Message Templates

The following message types are implemented:

1. **Registration Confirmation** - Sent when a user registers
2. **Login Alert** - Optional security notification (disabled by default)
3. **Appointment Booked** - Sent when an appointment is created
4. **Appointment Cancelled** - Sent when an appointment is cancelled
5. **Appointment Rescheduled** - Sent when an appointment is rescheduled
6. **Appointment Status Update** - Sent when status changes (approved/rejected)
7. **Appointment Reminder** - Sent 1 hour before appointment (automated)

## Appointment Reminders

Appointment reminders are automatically sent via a cron job that runs every 5 minutes. The system:

- Checks for appointments scheduled 55-65 minutes from now
- Sends reminders only for `approved` or `pending` appointments
- Respects user's WhatsApp notification preferences
- Logs all reminder activities

To disable reminders, set `ENABLE_APPOINTMENT_REMINDERS=false` in your `.env` file.

## Troubleshooting

### WhatsApp service not initialized
- Check that all Twilio credentials are set in `.env`
- Verify credentials are correct (no extra spaces)
- Check server logs for specific error messages

### Messages not being sent
- Verify phone number format (must be Indian: `+91XXXXXXXXXX`)
- Check if user has `whatsappNotificationsEnabled` set to `true`
- Verify Twilio account has sufficient credits
- Check Twilio Console for message logs and errors

### Sandbox limitations
- Sandbox only works with pre-approved numbers
- You must join the sandbox first by sending the code to Twilio
- Free tier has rate limits

### Phone number validation
- Phone numbers are automatically formatted to `+91XXXXXXXXXX` format
- Duplicate phone numbers are prevented during registration
- Phone numbers are validated on both frontend and backend

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment-specific credentials** - Different credentials for dev/staging/prod
3. **Rotate credentials regularly** - Update Twilio tokens periodically
4. **Monitor usage** - Check Twilio Console for unusual activity
5. **Log message status** - Monitor logs for failed messages

## Cost Considerations

- Twilio offers a free trial with credits
- WhatsApp messages via Twilio are charged per message
- Check Twilio pricing: https://www.twilio.com/pricing
- Appointment reminders run every 5 minutes - consider frequency for cost optimization

## Support

For issues with:
- **Twilio API**: Check Twilio Console logs and documentation
- **Integration**: Check server logs and error messages
- **Message delivery**: Verify phone numbers and Twilio account status

## Additional Resources

- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [WhatsApp Business API Guide](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-message-node-js)

