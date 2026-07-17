require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

(async () => {
  try {
    const uri = process.env.MONGO_URI.replace('/libraryApp', '/test');
    console.log('Connecting to URI:', uri);
    await mongoose.connect(uri);
    console.log('Connected to database.\n');

    const students = await Student.find({ isActive: true, plan: 'VIP', admissionFeePaid: true });
    let fixedCount = 0;

    for (const student of students) {
      // Since they are VIP, they shouldn't have been charged the admission fee (100)
      // Decrease their totalPaid by 100
      student.totalPaid -= 100;
      student.admissionFeePaid = false; // set to false so we don't double fix them if run again
      await student.save();
      fixedCount++;
      console.log(`[FIX] Refunded admission fee for VIP student: ${student.name} (Total Paid now: ${student.totalPaid})`);
    }

    if (fixedCount === 0) {
      console.log('✅ All VIP students are already correct! No changes needed.');
    } else {
      console.log(`✅ Fixed ${fixedCount} VIP student(s) who were incorrectly charged admission fees.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
})();
