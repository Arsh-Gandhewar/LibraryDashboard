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
    const uri = process.env.MONGO_URI.replace('/libraryApp', '/test');
    console.log('Connecting to URI:', uri);
    await mongoose.connect(uri);
    console.log('Connected to database.\n');

    const students = await Student.find({ isActive: true });
    let fixedCount = 0;

    for (const student of students) {
      let needsSave = false;

      // The correct expiry date starts as joiningDate + 1 month
      let currentExpiry = addOneMonth(student.joiningDate);

      // Re-calculate the expiry date for every renewal the student had
      for (let i = 0; i < student.renewalHistory.length; i++) {
        const correctRenewalExpiry = addOneMonth(currentExpiry);
        
        // Update history if it's incorrect
        if (student.renewalHistory[i].expiryDate.getTime() !== correctRenewalExpiry.getTime()) {
          student.renewalHistory[i].expiryDate = correctRenewalExpiry;
          needsSave = true;
        }
        
        currentExpiry = correctRenewalExpiry;
      }

      // Check if the final expiry date is correct
      if (student.expiryDate.getTime() !== currentExpiry.getTime()) {
        console.log(`[FIX] ${student.name}:`);
        console.log(`  Old expiry: ${new Date(student.expiryDate).toLocaleDateString()}`);
        console.log(`  New expiry: ${currentExpiry.toLocaleDateString()}`);
        console.log(`  Based on Join Date: ${new Date(student.joiningDate).toLocaleDateString()} with ${student.renewalHistory.length} renewals`);
        console.log('');
        
        student.expiryDate = currentExpiry;
        needsSave = true;
      }

      if (needsSave) {
        await student.save();
        fixedCount++;
      }
    }

    if (fixedCount === 0) {
      console.log('✅ All expiry dates already match their joining dates! No changes needed.');
    } else {
      console.log(`✅ Fixed ${fixedCount} student(s) with mismatched expiry dates.`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
})();
