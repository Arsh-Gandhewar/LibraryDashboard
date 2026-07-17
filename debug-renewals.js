require('dotenv').config();
const connectDB = require('./backend/config/db');
const Student = require('./backend/models/Student');

(async () => {
  await connectDB();
  const s = await Student.find({ isActive: true, 'renewalHistory.0': { $exists: true } });
  console.log(JSON.stringify(s.map(x => ({ name: x.name, join: x.joiningDate, history: x.renewalHistory })), null, 2));
  process.exit(0);
})();
