/**
 * backend/config/db.js — MongoDB connection helper.
 *
 * Reads MONGO_URI from environment variables, connects via Mongoose,
 * and logs the connection status. Exits the process on failure so the
 * app never runs in a half-connected state.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using the URI in process.env.MONGO_URI.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`📦 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
