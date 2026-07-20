require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI.replace('/libraryApp', '/test'));
  const s = await mongoose.connection.db.collection('students').find({ 'renewalHistory.0': { $exists: true } }).toArray();
  console.log(JSON.stringify(s.map(x => ({ name: x.name, history: x.renewalHistory })), null, 2));
  process.exit(0);
})();
