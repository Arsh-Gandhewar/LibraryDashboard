/**
 * backend/routes/students.js — Express router for all API endpoints.
 *
 * Every route delegates to a controller function in studentController.js.
 * The router is mounted at /api in server.js, so the full paths are e.g.
 *   GET  /api/students
 *   POST /api/students/:id/renew
 */

const express = require('express');
const router = express.Router();

const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  renewStudent,
  getSeats,
  getDashboard,
  getRevenue,
  getDueStudents,
} = require('../controllers/studentController');

// ─── Student CRUD ────────────────────────────
router.get('/students',     getAllStudents);   // List all active students
router.get('/students/:id', getStudentById);  // Get single student
router.post('/students',    createStudent);    // Create new student
router.put('/students/:id', updateStudent);    // Update existing student
router.delete('/students/:id', deleteStudent); // Soft-delete student

// ─── Renewal ─────────────────────────────────
router.post('/students/:id/renew', renewStudent);

// ─── Seat map ────────────────────────────────
router.get('/seats', getSeats);

// ─── Dashboard & analytics ───────────────────
router.get('/dashboard', getDashboard);
router.get('/revenue',   getRevenue);
router.get('/due',       getDueStudents);

module.exports = router;
