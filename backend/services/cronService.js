const cron = require('node-cron');
const Student = require('../models/Student');
const { sendWhatsAppMessage } = require('./whatsappService');

/**
 * Initializes the cron jobs for the application.
 */
const initCronJobs = () => {
  // Run every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily cron job for due reminders...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      // Find all students whose expiryDate is exactly today
      const dueStudents = await Student.find({
        isActive: true,
        expiryDate: {
          $gte: today,
          $lte: endOfToday
        }
      });

      console.log(`Found ${dueStudents.length} students due today.`);

      for (const student of dueStudents) {
        // Template name: 'subscription_due_reminder'
        const success = await sendWhatsAppMessage(student.mobile, 'subscription_due_reminder', student.name);
        if (success) {
          console.log(`Reminder sent to ${student.name} (${student.mobile})`);
        }
      }
    } catch (error) {
      console.error('Error running daily cron job:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Runs at 10 AM IST
  });
};

module.exports = { initCronJobs };
