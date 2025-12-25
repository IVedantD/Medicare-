const twilio = require('twilio');

/**
 * WhatsApp Service for MediCare
 * Handles all WhatsApp notifications using Twilio WhatsApp API
 */

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // Format: whatsapp:+14155238886

  if (!accountSid || !authToken || !whatsappFrom) {
    console.warn('[WhatsApp] ⚠️  Twilio credentials not configured. WhatsApp notifications will be disabled.');
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[WhatsApp] ✅ Twilio client initialized successfully');
    return twilioClient;
  } catch (error) {
    console.error('[WhatsApp] ❌ Failed to initialize Twilio client:', error.message);
    return null;
  }
};

// Initialize on module load
if (process.env.NODE_ENV !== 'test') {
  initializeTwilio();
}

/**
 * Format phone number to E.164 format for Twilio
 * Converts Indian phone numbers to +91XXXXXXXXXX format
 */
const formatPhoneForTwilio = (phone) => {
  if (!phone) return null;

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If starts with +91, ensure it's followed by 10 digits
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.substring(3);
    if (digits.length === 10) {
      return `whatsapp:+91${digits}`;
    }
  }

  // If starts with 91 (without +), add +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `whatsapp:+${cleaned}`;
  }

  // If just 10 digits, assume India and add +91
  if (/^\d{10}$/.test(cleaned)) {
    return `whatsapp:+91${cleaned}`;
  }

  // If already in E.164 format, add whatsapp: prefix
  if (cleaned.startsWith('+')) {
    return `whatsapp:${cleaned}`;
  }

  return null;
};

/**
 * Send WhatsApp message
 * @param {string} to - Recipient phone number (will be formatted)
 * @param {string} message - Message content
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Result object with success status
 */
const sendWhatsAppMessage = async (to, message, options = {}) => {
  // Check if WhatsApp is enabled
  if (!twilioClient) {
    console.warn('[WhatsApp] ⚠️  WhatsApp service not initialized. Message not sent.');
    return {
      success: false,
      error: 'WhatsApp service not configured',
      skipped: true
    };
  }

  // Check if notifications are disabled for this user
  if (options.disabled === true) {
    console.log('[WhatsApp] ℹ️  WhatsApp notifications disabled for user. Message skipped.');
    return {
      success: false,
      error: 'WhatsApp notifications disabled',
      skipped: true
    };
  }

  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
  if (!whatsappFrom) {
    console.error('[WhatsApp] ❌ TWILIO_WHATSAPP_FROM not configured');
    return {
      success: false,
      error: 'WhatsApp sender number not configured'
    };
  }

  // Format recipient phone number
  const formattedTo = formatPhoneForTwilio(to);
  if (!formattedTo) {
    console.error(`[WhatsApp] ❌ Invalid phone number format: ${to}`);
    return {
      success: false,
      error: 'Invalid phone number format'
    };
  }

  try {
    const messageData = {
      from: whatsappFrom,
      to: formattedTo,
      body: message
    };

    console.log(`[WhatsApp] 📤 Sending message to ${formattedTo}...`);
    
    const result = await twilioClient.messages.create(messageData);

    console.log(`[WhatsApp] ✅ Message sent successfully. SID: ${result.sid}`);
    
    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: formattedTo
    };
  } catch (error) {
    console.error('[WhatsApp] ❌ Failed to send message:', error.message);
    console.error('[WhatsApp] Error details:', {
      code: error.code,
      status: error.status,
      message: error.message
    });

    return {
      success: false,
      error: error.message,
      code: error.code,
      status: error.status
    };
  }
};

/**
 * Retry sending WhatsApp message with exponential backoff
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @param {object} options - Additional options
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<object>} - Result object
 */
const sendWhatsAppMessageWithRetry = async (to, message, options = {}, maxRetries = 3) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendWhatsAppMessage(to, message, options);

    if (result.success) {
      return result;
    }

    // Don't retry if notifications are disabled or service not configured
    if (result.skipped) {
      return result;
    }

    lastError = result;

    // If not the last attempt, wait before retrying
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
      console.log(`[WhatsApp] ⏳ Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`[WhatsApp] ❌ Failed to send message after ${maxRetries} attempts`);
  return lastError;
};

/**
 * Message Templates
 * Pre-approved WhatsApp message templates for MediCare
 */

const messageTemplates = {
  /**
   * Registration confirmation message
   */
  registration: (userName, role) => {
    return `🎉 Welcome to MediCare, ${userName}!

Your ${role} account has been successfully registered.

We're here to help you manage your healthcare needs. You'll receive important updates about your appointments via WhatsApp.

Thank you for choosing MediCare!

For support, contact us at: ${process.env.SUPPORT_PHONE || '+91 XXXXX XXXXX'}`;
  },

  /**
   * Login alert message (optional security notification)
   */
  loginAlert: (userName, loginTime) => {
    const time = new Date(loginTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return `🔐 Security Alert - MediCare

Hello ${userName},

You successfully logged into your MediCare account on ${time}.

If this wasn't you, please contact us immediately.

For support: ${process.env.SUPPORT_PHONE || '+91 XXXXX XXXXX'}`;
  },

  /**
   * Appointment booking confirmation
   */
  appointmentBooked: (patientName, doctorName, date, time, clinicName = 'MediCare Clinic') => {
    const appointmentDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    return `✅ Appointment Confirmed - MediCare

Hello ${patientName},

Your appointment has been successfully booked!

👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${appointmentDate}
🕐 Time: ${time}
🏥 Clinic: ${clinicName}

Please arrive 10 minutes before your scheduled time.

We'll send you a reminder 1 hour before your appointment.

Thank you for choosing MediCare!`;
  },

  /**
   * Appointment cancellation notification
   */
  appointmentCancelled: (patientName, doctorName, date, time, reason = '') => {
    const appointmentDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    let message = `❌ Appointment Cancelled - MediCare

Hello ${patientName},

Your appointment has been cancelled.

👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${appointmentDate}
🕐 Time: ${time}`;

    if (reason) {
      message += `\n\nReason: ${reason}`;
    }

    message += `\n\nYou can book a new appointment anytime through the MediCare app.

For support: ${process.env.SUPPORT_PHONE || '+91 XXXXX XXXXX'}`;

    return message;
  },

  /**
   * Appointment rescheduled notification
   */
  appointmentRescheduled: (patientName, doctorName, oldDate, oldTime, newDate, newTime) => {
    const oldAppointmentDate = new Date(oldDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const newAppointmentDate = new Date(newDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    return `🔄 Appointment Rescheduled - MediCare

Hello ${patientName},

Your appointment has been rescheduled.

👨‍⚕️ Doctor: Dr. ${doctorName}

❌ Previous:
📅 Date: ${oldAppointmentDate}
🕐 Time: ${oldTime}

✅ New:
📅 Date: ${newAppointmentDate}
🕐 Time: ${newTime}

Please make a note of the new date and time.

We'll send you a reminder 1 hour before your appointment.

Thank you!`;
  },

  /**
   * Appointment status update (approved/rejected)
   */
  appointmentStatusUpdate: (patientName, doctorName, date, time, status) => {
    const appointmentDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    const statusEmoji = {
      approved: '✅',
      rejected: '❌',
      completed: '✅'
    };

    const statusText = {
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    };

    const emoji = statusEmoji[status] || '📋';
    const text = statusText[status] || status;

    let message = `${emoji} Appointment ${text} - MediCare

Hello ${patientName},

Your appointment status has been updated.

👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${appointmentDate}
🕐 Time: ${time}
📋 Status: ${text}`;

    if (status === 'approved') {
      message += `\n\nYour appointment has been confirmed! Please arrive 10 minutes before your scheduled time.

We'll send you a reminder 1 hour before your appointment.`;
    } else if (status === 'rejected') {
      message += `\n\nUnfortunately, your appointment request could not be approved at this time. Please book a new appointment.

For support: ${process.env.SUPPORT_PHONE || '+91 XXXXX XXXXX'}`;
    }

    return message;
  },

  /**
   * Appointment reminder (1 hour before)
   */
  appointmentReminder: (patientName, doctorName, date, time, clinicName = 'MediCare Clinic') => {
    const appointmentDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });

    return `⏰ Appointment Reminder - MediCare

Hello ${patientName},

This is a reminder for your upcoming appointment.

👨‍⚕️ Doctor: Dr. ${doctorName}
📅 Date: ${appointmentDate}
🕐 Time: ${time}
🏥 Clinic: ${clinicName}

Your appointment is in 1 hour. Please arrive 10 minutes early.

See you soon!

MediCare Team`;
  },

  /**
   * Password changed notification
   */
  passwordChanged: (userName, changeTime) => {
    const time = new Date(changeTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    return `🔐 Password Changed - MediCare

Hello ${userName},

Your MediCare account password was successfully changed on ${time}.

If you did not make this change, please contact us immediately for security assistance.

For support: ${process.env.SUPPORT_PHONE || '+91 XXXXX XXXXX'}

MediCare Security Team`;
  }
};

/**
 * Send notification wrapper
 * Handles errors gracefully without blocking main flow
 */
const sendNotification = async (type, recipientPhone, templateData, options = {}) => {
  // Don't block if WhatsApp fails
  try {
    if (!recipientPhone) {
      console.log(`[WhatsApp] ℹ️  No phone number provided for ${type} notification. Skipped.`);
      return { success: false, skipped: true, reason: 'No phone number' };
    }

    const template = messageTemplates[type];
    if (!template) {
      console.error(`[WhatsApp] ❌ Unknown message template type: ${type}`);
      return { success: false, error: 'Unknown template type' };
    }

    const message = template(...templateData);
    const result = await sendWhatsAppMessageWithRetry(recipientPhone, message, options);

    // Log result (without sensitive data)
    if (result.success) {
      console.log(`[WhatsApp] ✅ ${type} notification sent successfully to ${recipientPhone.substring(0, 10)}...`);
    } else if (!result.skipped) {
      console.error(`[WhatsApp] ❌ Failed to send ${type} notification: ${result.error}`);
    }

    return result;
  } catch (error) {
    // Never throw - WhatsApp failures should not break the main flow
    console.error(`[WhatsApp] ❌ Unexpected error sending ${type} notification:`, error.message);
    return {
      success: false,
      error: error.message,
      unexpected: true
    };
  }
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppMessageWithRetry,
  sendNotification,
  messageTemplates,
  formatPhoneForTwilio,
  initializeTwilio
};

