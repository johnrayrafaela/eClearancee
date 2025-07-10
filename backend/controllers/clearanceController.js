// In controllers/clearanceController.js
const User = require('../models/User');
const Subject = require('../models/Subject');
const Clearance = require('../models/Clearance');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt'); // Make sure to install bcrypt if not yet

exports.getStudentClearanceInfo = async (req, res) => {
  try {
    // Assume student_id is available from auth/session
    const student_id = req.user.student_id; // or froam req.params or req.query
    const student = await User.findByPk(student_id);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Get subjects for student's course and year_level
    const subjects = await Subject.findAll({
      where: {
        course: student.course,
        year_level: student.year_level,
      }
    });

    // Optionally, include teachers if you have a relation
    // const subjectsWithTeachers = await Subject.findAll({
    //   where: { course: student.course, year_level: student.year_level },
    //   include: [{ model: Teacher }]
    // });

    res.json({
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects, // or subjectsWithTeachers
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createClearance = async (req, res) => {
  try {
    const { student_id, semester } = req.body;
    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if clearance already exists for this semester
    const existing = await Clearance.findOne({ where: { student_id, semester } });
    if (existing) {
      return res.status(400).json({ message: 'You already have a clearance for this semester. Delete it to create a new one.' });
    }

    // Save semester in clearance (add semester column to Clearance model if needed)
    const clearance = await Clearance.create({ student_id, semester });

    // Fetch subjects for the selected semester
    const subjects = await Subject.findAll({
      where: { course: student.course, year_level: student.year_level, semester }
    });

    res.status(201).json({
      message: 'Clearance created',
      clearance,
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.precheckClearance = async (req, res) => {
  try {
    const { student_id, semester } = req.query;
    const student = await User.findByPk(student_id);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Filter subjects by semester
    const where = {
      course: student.course,
      year_level: student.year_level,
    };
    if (semester) where.semester = semester;

    const subjects = await Subject.findAll({ where });

    res.json({
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClearanceStatus = async (req, res) => {
  try {
    const { student_id, semester } = req.query;
    const whereClearance = { student_id };
    if (semester) whereClearance.semester = semester;
    const clearance = await Clearance.findOne({ where: whereClearance });
    if (!clearance) return res.status(404).json({ message: 'No clearance found for this student.' });

    const student = await User.findByPk(student_id);

    // Filter subjects by semester
    const whereSubject = {
      course: student.course,
      year_level: student.year_level,
    };
    if (semester) whereSubject.semester = semester;

    const subjects = await Subject.findAll({
      where: whereSubject,
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['teacher_id', 'firstname', 'lastname', 'email']
        }
      ]
    });

    res.json({
      clearance,
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteClearance = async (req, res) => {
  try {
    const { student_id, password, semester } = req.body;
    const clearance = await Clearance.findOne({ where: { student_id, semester } });
    if (!clearance) return res.status(404).json({ message: 'No clearance found to delete.' });

    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // Check password
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password.' });

    await clearance.destroy();
    res.json({ message: 'Clearance deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.adminDeleteClearance = async (req, res) => {
  try {
    const { student_id } = req.body;
    const clearance = await Clearance.findOne({ where: { student_id } });
    if (!clearance) return res.status(404).json({ message: 'No clearance found to delete.' });

    await clearance.destroy();
    res.json({ message: 'Clearance deleted by admin.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllClearanceRequests = async (req, res) => {
  try {
    // Join with User to get student info
    const clearances = await Clearance.findAll({
      include: [{
        model: require('../models/User'),
        as: 'student',
        attributes: ['student_id', 'firstname', 'lastname', 'course', 'year_level', 'block', 'email']
      }]
    });
    res.json(clearances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateClearanceStatus = async (req, res) => {
  try {
    const { clearance_id } = req.params;
    const { status } = req.body; // status: 'Approved' or 'Rejected'
    const clearance = await Clearance.findByPk(clearance_id);
    if (!clearance) return res.status(404).json({ message: 'Clearance not found.' });
    clearance.status = status;
    await clearance.save();

    // After updating the clearance status to 'Approved'
    await User.update(
      { clearance_status: 'approved' },
      { where: { student_id: clearance.student_id } }
    );

    res.json({ message: `Clearance ${status.toLowerCase()}.`, clearance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClearanceStatusAnalytics = async (req, res) => {
  try {
    // Count clearances grouped by status
    const { Sequelize } = require('sequelize');
    const results = await Clearance.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Format as { status: count }
    const analytics = {};
    results.forEach(row => {
      analytics[row.status] = parseInt(row.get('count'), 10);
    });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};