/**
 * backend/models/Student.js — Mongoose model for a library student / member.
 *
 * Fields cover personal info, subscription plan, seat allocation,
 * financial tracking, and renewal history.  Soft-delete is supported
 * via the `isActive` flag.
 */

const mongoose = require('mongoose');

// ────────────────────────────────────────────
// Sub-schema: one entry in the renewal history
// ────────────────────────────────────────────
const renewalEntrySchema = new mongoose.Schema(
  {
    renewalDate: { type: Date, required: true },
    expiryDate:  { type: Date, required: true },
    amount:      { type: Number, required: true },
    paidAt:      { type: Date, default: Date.now },
  },
  { _id: false } // No separate _id for sub-documents
);

// ────────────────────────────────────────────
// Main schema
// ────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },

  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\d{10}$/, 'Mobile must be exactly 10 digits'],
  },

  plan: {
    type: String,
    enum: {
      values: ['VIP', 'Confirm', 'Waiting'],
      message: '{VALUE} is not a valid plan',
    },
    required: [true, 'Subscription plan is required'],
  },

  seatNumber: {
    type: String,
    default: null,
  },

  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
  },

  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },

  admissionFeePaid: {
    type: Boolean,
    default: true,
  },

  renewalHistory: {
    type: [renewalEntrySchema],
    default: [],
  },

  totalPaid: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ────────────────────────────────────────────
// Indexes
// ────────────────────────────────────────────

// Prevent two *active* students from sharing the same mobile number.
// Inactive (soft-deleted) records are excluded via partialFilterExpression.
studentSchema.index(
  { mobile: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

// Fast look-ups by seat number (used heavily by the seat-map endpoint).
studentSchema.index({ seatNumber: 1 });

module.exports = mongoose.model('Student', studentSchema);
