const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Teacher  = require('../models/Teacher');

exports.registerTeacher = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    const existing = await Teacher.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Teacher registered', teacher_id: teacher.teacher_id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ where: { email } });
    if (!teacher) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher.teacher_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      teacher: {
        teacher_id: teacher.teacher_id,
        firstname: teacher.firstname,
        lastname: teacher.lastname,
        email: teacher.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// Create teacher
exports.createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updated = await Teacher.update(updateData, {
      where: { teacher_id: req.params.id },
    });
    if (updated[0] === 0) return res.status(404).json({ message: 'Teacher not found or no changes' });
    res.status(200).json({ message: 'Teacher updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete teacher (with cascade for related subjects and subject statuses)
const Subject = require('../models/Subject');
const StudentSubjectStatus = require('../models/StudentSubjectStatus');
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // Find all subject IDs for this teacher
    const subjects = await Subject.findAll({ where: { teacher_id: req.params.id } });
    const subjectIds = subjects.map(s => s.subject_id);

    // Delete related StudentSubjectStatus records for these subjects
    if (subjectIds.length > 0) {
      await StudentSubjectStatus.destroy({ where: { subject_id: subjectIds } });
    }

    // Delete related subjects
    await Subject.destroy({ where: { teacher_id: req.params.id } });

    // Delete teacher
    await teacher.destroy();
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
