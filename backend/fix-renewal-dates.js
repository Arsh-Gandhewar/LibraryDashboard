require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const addOneMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
};

(async () => {
  try {
    // Connect explicitly to the 'test' database where the 95 students are stored
    const uri = process.env.MONGO_URI.replace('/libraryApp', '/test');
    console.log('Connecting to URI:', uri);
    await mongoose.connect(uri);
    console.log('Connected to database.\n');

    const students = await Student.find({ isActive: true });
    let fixedCount = 0;

    for (const student of students) {
      if (student.renewalHistory.length === 0) continue;

      // The first expiry is joiningDate + 1 month (this was set correctly at admission)
      let previousExpiry = addOneMonth(student.joiningDate);
      let needsSave = false;

      for (let i = 0; i < student.renewalHistory.length; i++) {
        const renewal = student.renewalHistory[i];

        // Correct expiry for this renewal = previous end date + 1 month
        const correctExpiry = addOneMonth(previousExpiry);

        // Check if the stored expiry is wrong
        const storedExpiry = new Date(renewal.expiryDate).getTime();
        const expectedExpiry = correctExpiry.getTime();

        if (storedExpiry !== expectedExpiry) {
          console.log(`[FIX] ${student.name} (${student.plan}) - Renewal #${i + 1}:`);
          console.log(`  Old expiry: ${new Date(storedExpiry).toLocaleDateString()}`);
          console.log(`  New expiry: ${correctExpiry.toLocaleDateString()}`);
          console.log(`  Previous end date was: ${new Date(previousExpiry).toLocaleDateString()}`);
          console.log('');

          student.renewalHistory[i].expiryDate = correctExpiry;
          needsSave = true;
        }

        // Move forward: this renewal's correct expiry becomes the next "previous"
        previousExpiry = correctExpiry;
      }

      if (needsSave) {
        // The student's current expiryDate should be the last renewal's correct expiry
        const lastCorrectExpiry = student.renewalHistory[student.renewalHistory.length - 1].expiryDate;
        console.log(`  Updating ${student.name}'s current expiryDate to: ${new Date(lastCorrectExpiry).toLocaleDateString()}\n`);
        student.expiryDate = lastCorrectExpiry;
        await student.save();
        fixedCount++;
      }
    }

    if (fixedCount === 0) {
      console.log('✅ All renewal dates are already correct! No changes needed.');
    } else {
      console.log(`✅ Fixed ${fixedCount} student(s) with incorrect renewal dates.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
})();
