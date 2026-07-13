/**
 * server.js — Entry point for the Library Management Dashboard API.
 *
 * Loads environment variables, connects to MongoDB, sets up middleware,
 * mounts API routes, and starts the Express server.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const connectDB = require('./backend/config/db');
const studentRoutes = require('./backend/routes/students');

const app = express();

// --------------- Middleware ---------------

// Enable Cross-Origin Resource Sharing for all origins
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Frontend is now managed by Vite in the /client directory, 
// so we don't serve static files from /public anymore in dev.
// --------------- API Routes ---------------

// All API endpoints are mounted under /api
app.use('/api', studentRoutes);

// --------------- Start Server ---------------

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Connect to MongoDB Atlas before accepting requests
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();
