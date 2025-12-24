const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendNotification } = require('./whatsapp.service');

/**
 * Appointment Reminder Service
 * Sends WhatsApp reminders 1 hour before appointments
 */

let reminderJob = null;

/**
 * Check and send reminders for appointments
 */
const checkAndSendReminders = async () => {
  try {
    console.log('[Reminder] 🔍 Checking for appointments needing reminders...');

    // Calculate time range: appointments between 55 minutes and 65 minutes from now
    const now = new Date();
    const reminderTimeStart = new Date(now.getTime() + 55 * 60 * 1000); // 55 minutes from now
    const reminderTimeEnd = new Date(now.getTime() + 65 * 60 * 1000); // 65 minutes from now

    // Find appointments that:
    // 1. Are scheduled between reminderTimeStart and reminderTimeEnd
    // 2. Have status 'approved' or 'pending'
    // 3. Haven't been completed or cancelled
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(reminderTimeStart.setHours(0, 0, 0, 0)),
        $lte: new Date(reminderTimeEnd.setHours(23, 59, 59, 999))
      },
      status: { $in: ['approved', 'pending'] }
    })
      .populate('patient', 'name phone whatsappNotificationsEnabled')
      .populate('doctor', 'name');

    if (appointments.length === 0) {
      console.log('[Reminder] ℹ️  No appointments need reminders at this time.');
      return;
    }

    console.log(`[Reminder] 📋 Found ${appointments.length} appointment(s) to check...`);

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const appointment of appointments) {
      try {
        // Check if appointment time is within the reminder window
        const appointmentDateTime = new Date(appointment.date);
        const [timeStr, period] = appointment.time.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        let appointmentHour = hours;
        if (period && period.toUpperCase() === 'PM' && hours !== 12) {
          appointmentHour += 12;
        } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
          appointmentHour = 0;
        }

        appointmentDateTime.setHours(appointmentHour, minutes, 0, 0);

        // Check if appointment is between 55-65 minutes from now
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff < 55 || minutesDiff > 65) {
          continue; // Skip if not in the reminder window
        }

        // Check if we've already sent a reminder (you could add a 'reminderSent' field to track this)
        // For now, we'll send reminders every time the cron runs (which is fine for 1-hour window)

        // Send reminder if patient has phone and notifications enabled
        if (appointment.patient?.phone && appointment.patient?.whatsappNotificationsEnabled) {
          const result = await sendNotification(
            'appointmentReminder',
            appointment.patient.phone,
            [
              appointment.patient.name,
              appointment.doctor?.name || 'Doctor',
              appointment.date,
              appointment.time,
              process.env.CLINIC_NAME || 'MediCare Clinic'
            ],
            { disabled: !appointment.patient.whatsappNotificationsEnabled }
          );

          if (result.success) {
            sentCount++;
            console.log(`[Reminder] ✅ Sent reminder for appointment ${appointment._id}`);
            
            // Optional: Mark reminder as sent (you could add a field to Appointment model)
            // await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });
          } else if (result.skipped) {
            skippedCount++;
          } else {
            errorCount++;
            console.error(`[Reminder] ❌ Failed to send reminder for appointment ${appointment._id}: ${result.error}`);
          }
        } else {
          skippedCount++;
          console.log(`[Reminder] ⏭️  Skipped reminder for appointment ${appointment._id} (no phone or notifications disabled)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`[Reminder] ❌ Error processing appointment ${appointment._id}:`, error.message);
      }
    }

    console.log(`[Reminder] ✅ Completed: ${sentCount} sent, ${skippedCount} skipped, ${errorCount} errors`);
  } catch (error) {
    console.error('[Reminder] ❌ Error in reminder check:', error);
  }
};

/**
 * Start the reminder scheduler
 * Runs every 5 minutes to check for appointments needing reminders
 */
const startReminderScheduler = () => {
  // Check every 5 minutes
  // Cron format: '*/5 * * * *' = every 5 minutes
  // For production, you might want to run it more frequently (every 1-2 minutes)
  
  if (reminderJob) {
    console.log('[Reminder] ⚠️  Reminder scheduler already running');
    return;
  }

  // Run every 5 minutes
  reminderJob = cron.schedule('*/5 * * * *', async () => {
    await checkAndSendReminders();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // India timezone
  });

  console.log('[Reminder] ✅ Appointment reminder scheduler started (runs every 5 minutes)');
  
  // Run immediately on startup to catch any missed reminders
  setTimeout(() => {
    checkAndSendReminders();
  }, 10000); // Wait 10 seconds after server starts
};

/**
 * Stop the reminder scheduler
 */
const stopReminderScheduler = () => {
  if (reminderJob) {
    reminderJob.stop();
    reminderJob = null;
    console.log('[Reminder] ⏹️  Appointment reminder scheduler stopped');
  }
};

/**
 * Manually trigger reminder check (for testing)
 */
const triggerReminderCheck = async () => {
  console.log('[Reminder] 🔄 Manually triggering reminder check...');
  await checkAndSendReminders();
};

module.exports = {
  startReminderScheduler,
  stopReminderScheduler,
  checkAndSendReminders,
  triggerReminderCheck
};

