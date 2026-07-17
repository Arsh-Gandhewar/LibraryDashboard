/**
 * backend/controllers/studentController.js
 *
 * Business-logic layer for every API endpoint.  Each exported function
 * receives (req, res) and returns a JSON response.  All date comparisons
 * are done at day-level precision (time stripped to 00:00:00.000).
 */

const Student = require('../models/Student');

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

/**
 * Return a Date set to the very start of the given day (00:00:00.000).
 * @param {Date|string} date
 * @returns {Date}
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Return a Date set to the very end of the given day (23:59:59.999).
 * @param {Date|string} date
 * @returns {Date}
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Add one calendar month to a date.
 * e.g. Jan 31 → Feb 28/29 (JS Date handles overflow automatically).
 * @param {Date|string} date
 * @returns {Date}
 */
const addOneMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
};

/**
 * Get the base plan fee (monthly subscription, NO admission fee).
 * @param {'VIP'|'Confirm'|'Waiting'} plan
 * @returns {number}
 */
const planFee = (plan) => {
  const fees = { VIP: 1000, Confirm: 650, Waiting: 550 };
  return fees[plan] || 0;
};

/** Admission fee constant */
const ADMISSION_FEE = 100;

/** Total VIP seats and Confirm seats */
const TOTAL_VIP_SEATS     = 10;
const TOTAL_CONFIRM_SEATS = 68;

/**
 * Validate a seat number against the student's plan.
 * Returns an error string if invalid, or null if valid.
 */
const validateSeat = (plan, seatNumber) => {
  if (plan === 'Waiting') {
    // Waiting students must NOT have a seat
    if (seatNumber) {
      return 'Waiting-plan students cannot have a seat number';
    }
    return null;
  }

  if (plan === 'VIP') {
    if (!seatNumber || !seatNumber.match(/^V(\d+)$/)) {
      return 'VIP seat must be in the format V1–V10';
    }
    const num = parseInt(seatNumber.slice(1), 10);
    if (num < 1 || num > TOTAL_VIP_SEATS) {
      return `VIP seat number must be between V1 and V${TOTAL_VIP_SEATS}`;
    }
  }

  if (plan === 'Confirm') {
    if (!seatNumber || !seatNumber.match(/^C(\d+)$/)) {
      return 'Confirm seat must be in the format C1–C68';
    }
    const num = parseInt(seatNumber.slice(1), 10);
    if (num < 1 || num > TOTAL_CONFIRM_SEATS) {
      return `Confirm seat number must be between C1 and C${TOTAL_CONFIRM_SEATS}`;
    }
  }

  return null; // valid
};

// ═══════════════════════════════════════════════
//  CONTROLLERS
// ═══════════════════════════════════════════════

// ──────────────────────────────────────────────
//  GET /api/students — list all active students
// ──────────────────────────────────────────────
const getAllStudents = async (_req, res) => {
  try {
    // Case-insensitive alphabetical sort via collation
    const students = await Student.find({ isActive: true })
      .collation({ locale: 'en', strength: 2 })
      .sort({ name: 1 });

    res.json(students);
  } catch (err) {
    console.error('getAllStudents error:', err.message);
    res.status(500).json({ error: 'Server error while fetching students' });
  }
};

// ──────────────────────────────────────────────
//  GET /api/students/:id — get single student
// ──────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('getStudentById error:', err.message);
    res.status(500).json({ error: 'Server error while fetching student' });
  }
};

// ──────────────────────────────────────────────
//  POST /api/students — create new student
// ──────────────────────────────────────────────
const createStudent = async (req, res) => {
  try {
    const {
      name,
      mobile,
      plan,
      seatNumber,
      joiningDate,
      admissionFeePaid = true,
    } = req.body;

    // --- Basic field validation ---
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile must be exactly 10 digits' });
    }
    if (!plan || !['VIP', 'Confirm', 'Waiting'].includes(plan)) {
      return res.status(400).json({ error: 'Plan must be VIP, Confirm, or Waiting' });
    }
    if (!joiningDate) {
      return res.status(400).json({ error: 'Joining date is required' });
    }

    // --- Seat validation ---
    const seatErr = validateSeat(plan, seatNumber);
    if (seatErr) {
      return res.status(400).json({ error: seatErr });
    }

    // --- Duplicate mobile check (among active students) ---
    const mobileExists = await Student.findOne({ mobile, isActive: true });
    if (mobileExists) {
      return res.status(400).json({ error: 'An active student with this mobile number already exists' });
    }

    // --- Seat occupancy check ---
    if (seatNumber) {
      const seatTaken = await Student.findOne({ seatNumber, isActive: true });
      if (seatTaken) {
        return res.status(400).json({ error: `Seat ${seatNumber} is already occupied` });
      }
    }

    // --- Calculate expiry = joiningDate + 1 month ---
    const expiryDate = addOneMonth(joiningDate);

    // --- Calculate totalPaid (plan fee + optional admission fee) ---
    const totalPaid = planFee(plan) + (admissionFeePaid ? ADMISSION_FEE : 0);

    // --- Create and save ---
    const student = new Student({
      name: name.trim(),
      mobile,
      plan,
      seatNumber: plan === 'Waiting' ? null : seatNumber,
      joiningDate,
      expiryDate,
      admissionFeePaid,
      totalPaid,
    });

    const saved = await student.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('createStudent error:', err.message);
    res.status(500).json({ error: 'Server error while creating student' });
  }
};

// ──────────────────────────────────────────────
//  PUT /api/students/:id — update student
// ──────────────────────────────────────────────
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const {
      name,
      mobile,
      plan,
      seatNumber,
      joiningDate,
      expiryDate,
      admissionFeePaid,
    } = req.body;

    // --- Basic validation (same rules as create) ---
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    if (mobile !== undefined && !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile must be exactly 10 digits' });
    }
    if (plan !== undefined && !['VIP', 'Confirm', 'Waiting'].includes(plan)) {
      return res.status(400).json({ error: 'Plan must be VIP, Confirm, or Waiting' });
    }

    // Determine effective values (new or existing)
    const effectivePlan = plan !== undefined ? plan : student.plan;
    const effectiveSeat = seatNumber !== undefined ? seatNumber : student.seatNumber;

    // --- Seat validation ---
    const seatErr = validateSeat(effectivePlan, effectiveSeat);
    if (seatErr) {
      return res.status(400).json({ error: seatErr });
    }

    // --- If mobile changed, check for duplicate ---
    if (mobile && mobile !== student.mobile) {
      const mobileExists = await Student.findOne({
        mobile,
        isActive: true,
        _id: { $ne: student._id },
      });
      if (mobileExists) {
        return res.status(400).json({ error: 'An active student with this mobile number already exists' });
      }
    }

    // --- If seat changed, check occupancy ---
    if (
      effectiveSeat &&
      effectiveSeat !== student.seatNumber
    ) {
      const seatTaken = await Student.findOne({
        seatNumber: effectiveSeat,
        isActive: true,
        _id: { $ne: student._id },
      });
      if (seatTaken) {
        return res.status(400).json({ error: `Seat ${effectiveSeat} is already occupied` });
      }
    }

    // --- Apply updates ---
    if (name !== undefined)            student.name            = name.trim();
    if (mobile !== undefined)          student.mobile          = mobile;
    if (plan !== undefined)            student.plan            = plan;
    if (seatNumber !== undefined)      student.seatNumber      = effectivePlan === 'Waiting' ? null : seatNumber;
    if (joiningDate !== undefined)     student.joiningDate     = joiningDate;
    if (expiryDate !== undefined)      student.expiryDate      = expiryDate;
    if (admissionFeePaid !== undefined) student.admissionFeePaid = admissionFeePaid;

    const updated = await student.save();
    res.json(updated);
  } catch (err) {
    console.error('updateStudent error:', err.message);
    res.status(500).json({ error: 'Server error while updating student' });
  }
};

// ──────────────────────────────────────────────
//  DELETE /api/students/:id — soft-delete
// ──────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.isActive = false;
    await student.save();

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('deleteStudent error:', err.message);
    res.status(500).json({ error: 'Server error while deleting student' });
  }
};

// ──────────────────────────────────────────────
//  POST /api/students/:id/renew — renew subscription
// ──────────────────────────────────────────────
const renewStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // New expiry = previous end date + 1 calendar month
    // This ensures early/late payments don't shift the subscription cycle
    const newExpiry = addOneMonth(student.expiryDate);

    // Renewal amount = plan fee only (no admission fee on renewal)
    const amount = planFee(student.plan);

    // Record this renewal
    student.renewalHistory.push({
      renewalDate: new Date(),
      expiryDate: newExpiry,
      amount,
      paidAt: new Date(),
    });

    // Update current expiry and running total
    student.expiryDate = newExpiry;
    student.totalPaid += amount;

    const updated = await student.save();
    res.json(updated);
  } catch (err) {
    console.error('renewStudent error:', err.message);
    res.status(500).json({ error: 'Server error while renewing subscription' });
  }
};

// ──────────────────────────────────────────────
//  GET /api/seats — seat occupancy map
// ──────────────────────────────────────────────
const getSeats = async (_req, res) => {
  try {
    // Fetch only active students that actually have a seat
    const occupiedStudents = await Student.find({
      isActive: true,
      seatNumber: { $ne: null },
    }).select('seatNumber name _id joiningDate');

    // Build a lookup: seatNumber → { studentId, studentName, joiningDate }
    const occupancyMap = {};
    for (const s of occupiedStudents) {
      occupancyMap[s.seatNumber] = {
        studentId:   s._id,
        studentName: s.name,
        joiningDate: s.joiningDate,
      };
    }

    // VIP seats V1 – V10
    const vipSeats = [];
    for (let i = 1; i <= TOTAL_VIP_SEATS; i++) {
      const seat = `V${i}`;
      const occ  = occupancyMap[seat];
      vipSeats.push({
        seat,
        occupied:    !!occ,
        studentId:   occ ? occ.studentId   : null,
        studentName: occ ? occ.studentName : null,
        joiningDate: occ ? occ.joiningDate : null,
      });
    }

    // Confirm seats C1 – C68
    const confirmSeats = [];
    for (let i = 1; i <= TOTAL_CONFIRM_SEATS; i++) {
      const seat = `C${i}`;
      const occ  = occupancyMap[seat];
      confirmSeats.push({
        seat,
        occupied:    !!occ,
        studentId:   occ ? occ.studentId   : null,
        studentName: occ ? occ.studentName : null,
        joiningDate: occ ? occ.joiningDate : null,
      });
    }

    res.json({ vipSeats, confirmSeats });
  } catch (err) {
    console.error('getSeats error:', err.message);
    res.status(500).json({ error: 'Server error while fetching seat map' });
  }
};

// ──────────────────────────────────────────────
//  GET /api/dashboard — summary statistics
// ──────────────────────────────────────────────
const getDashboard = async (_req, res) => {
  try {
    const today      = startOfDay(new Date());
    const todayEnd   = endOfDay(new Date());

    // ── Current month boundaries ──
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // ── Active student counts ──
    const allActive = await Student.find({ isActive: true });
    const totalActive = allActive.length;

    const countByPlan = { VIP: 0, Confirm: 0, Waiting: 0 };
    let occupiedVIP     = 0;
    let occupiedConfirm = 0;

    for (const s of allActive) {
      countByPlan[s.plan] = (countByPlan[s.plan] || 0) + 1;

      if (s.seatNumber) {
        if (s.seatNumber.startsWith('V')) occupiedVIP++;
        if (s.seatNumber.startsWith('C')) occupiedConfirm++;
      }
    }

    const vacantVIP     = TOTAL_VIP_SEATS     - occupiedVIP;
    const vacantConfirm = TOTAL_CONFIRM_SEATS - occupiedConfirm;

    // ── Due today / expired ──
    let dueToday = 0;
    let expired  = 0;

    for (const s of allActive) {
      const exp = startOfDay(s.expiryDate);
      if (exp.getTime() === today.getTime()) dueToday++;
      if (exp.getTime() < today.getTime())   expired++;
    }

    // ── Monthly revenue ──
    //   = totalPaid of students created this month
    //   + sum of renewal amounts paid this month
    let monthlyRevenue = 0;

    for (const s of allActive) {
      const created = startOfDay(s.createdAt);
      if (created >= monthStart && created <= monthEnd) {
        monthlyRevenue += s.totalPaid;
      }

      for (const r of s.renewalHistory) {
        const paid = startOfDay(r.paidAt);
        if (paid >= monthStart && paid <= monthEnd) {
          // Only count the renewal amount if the student was NOT
          // also created this month (to avoid double-counting totalPaid).
          const wasCreatedThisMonth =
            startOfDay(s.createdAt) >= monthStart &&
            startOfDay(s.createdAt) <= monthEnd;
          if (!wasCreatedThisMonth) {
            monthlyRevenue += r.amount;
          }
        }
      }
    }

    // ── Recent admissions (last 5) ──
    const recentAdmissions = await Student.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name plan seatNumber joiningDate expiryDate createdAt');

    res.json({
      totalStudents:     totalActive,
      vipStudents:       countByPlan.VIP,
      confirmStudents:   countByPlan.Confirm,
      waitingStudents:   countByPlan.Waiting,
      vacantConfirmSeats: vacantConfirm,
      vacantVipSeats:    vacantVIP,
      dueTodayCount:     dueToday,
      expiredCount:      expired,
      monthlyRevenue,
      recentAdmissions,
    });
  } catch (err) {
    console.error('getDashboard error:', err.message);
    res.status(500).json({ error: 'Server error while fetching dashboard' });
  }
};

// ──────────────────────────────────────────────
//  GET /api/revenue — revenue breakdown
// ──────────────────────────────────────────────
const getRevenue = async (_req, res) => {
  try {
    const today      = startOfDay(new Date());
    const todayEnd   = endOfDay(new Date());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const allActive = await Student.find({ isActive: true });

    let monthlyRevenue       = 0;  // total revenue this month
    let todayCollection      = 0;  // admissions + renewals from today
    let admissionFeeCollection = 0; // sum of admission fees (₹100) this month
    let renewalCollection    = 0;  // sum of renewal amounts this month

    const revenueByPlan = {
      VIP:     { count: 0, amount: 0 },
      Confirm: { count: 0, amount: 0 },
      Waiting: { count: 0, amount: 0 },
    };

    for (const s of allActive) {
      const created = startOfDay(s.createdAt);

      // ── Students created this month ──
      if (created >= monthStart && created <= monthEnd) {
        // Plan fee portion
        const fee = planFee(s.plan);
        monthlyRevenue += fee;
        revenueByPlan[s.plan].amount += fee;
        revenueByPlan[s.plan].count  += 1;

        // Admission fee
        if (s.admissionFeePaid) {
          admissionFeeCollection += ADMISSION_FEE;
          monthlyRevenue += ADMISSION_FEE;
        }

        // Today's collection from this admission
        if (created >= today && created <= todayEnd) {
          todayCollection += fee + (s.admissionFeePaid ? ADMISSION_FEE : 0);
        }
      }

      // ── Renewal entries this month ──
      for (const r of s.renewalHistory) {
        const paid = startOfDay(r.paidAt);

        if (paid >= monthStart && paid <= monthEnd) {
          renewalCollection += r.amount;
          monthlyRevenue    += r.amount;
          revenueByPlan[s.plan].amount += r.amount;

          // Today's collection from this renewal
          if (paid >= today && paid <= todayEnd) {
            todayCollection += r.amount;
          }
        }
      }
    }

    res.json({
      monthlyRevenue,
      todayCollection,
      admissionFeeCollection,
      renewalCollection,
      revenueByPlan,
    });
  } catch (err) {
    console.error('getRevenue error:', err.message);
    res.status(500).json({ error: 'Server error while fetching revenue' });
  }
};

// ──────────────────────────────────────────────
//  GET /api/due — students due today / within 3 days / expired
// ──────────────────────────────────────────────
const getDueStudents = async (_req, res) => {
  try {
    const today = startOfDay(new Date());

    // "Within 3 days" upper bound
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    threeDaysLater.setHours(23, 59, 59, 999);

    // Find students whose expiry is ≤ 3 days from now (includes today & past)
    const students = await Student.find({
      isActive: true,
      expiryDate: { $lte: threeDaysLater },
    }).sort({ expiryDate: 1 });

    const result = students.map((s) => {
      const exp = startOfDay(s.expiryDate);

      let status;
      if (exp.getTime() === today.getTime()) {
        status = 'Due Today';
      } else if (exp.getTime() < today.getTime()) {
        status = 'Expired';
      } else {
        status = 'Expiring Soon';
      }

      return {
        _id:         s._id,
        name:        s.name,
        mobile:      s.mobile,
        plan:        s.plan,
        seatNumber:  s.seatNumber,
        expiryDate:  s.expiryDate,
        status,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('getDueStudents error:', err.message);
    res.status(500).json({ error: 'Server error while fetching due students' });
  }
};

// ═══════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════
module.exports = {
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
};
