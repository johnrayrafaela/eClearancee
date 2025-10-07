const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Teacher  = require('../models/Teacher');
const Subject = require('../models/Subject');
const StudentSubjectStatus = require('../models/StudentSubjectStatus');

exports.registerTeacher = async (req, res) => {
  let { firstname, lastname, email, password, signature } = req.body;
  email = (email || '').trim().toLowerCase();
  firstname = firstname?.trim();
  lastname = lastname?.trim();

  try {
  const existing = await Teacher.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({ firstname, lastname, email, password: hashedPassword, signature: signature || null });
    res.status(201).json({ message: 'Teacher registered', teacher: { teacher_id: teacher.teacher_id, firstname, lastname, email, signature: teacher.signature } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginTeacher = async (req, res) => {
  let { email, password } = req.body;
  email = (email || '').trim();
  password = password || '';
  const normalized = email.toLowerCase();

  try {
    // Case-insensitive lookup
    const { fn, col } = require('sequelize');
    let teacher = await Teacher.findOne({
      where: Teacher.sequelize.where(fn('LOWER', col('email')), normalized)
    });

    if (!teacher) {
      // Fallback scan (handles any legacy formatting)
      const probe = await Teacher.findAll({ attributes: ['teacher_id','email','password','firstname','lastname','signature'] });
      teacher = probe.find(t => (t.email || '').trim().toLowerCase() === normalized);
    }

    if (!teacher) {
      console.log(`[TEACHER LOGIN] Email not found: raw='${email}' normalized='${normalized}'`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      console.log(`[TEACHER LOGIN] Password mismatch for teacher_id=${teacher.teacher_id}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ teacher_id: teacher.teacher_id, role: 'teacher' }, process.env.JWT_SECRET || 'changeme', { expiresIn: '4h' });
    console.log(`[TEACHER LOGIN] Success teacher_id=${teacher.teacher_id}`);
    res.json({
      token,
      teacher: {
        teacher_id: teacher.teacher_id,
        firstname: teacher.firstname,
        lastname: teacher.lastname,
        email: teacher.email,
        signature: teacher.signature,
      }
    });
  } catch (err) {
    console.error('[TEACHER LOGIN] Unexpected error:', err);
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

exports.teacherDeleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id } = req.body;

    console.log('Delete request received for subject ID:', id, 'by teacher ID:', teacher_id);

    // Validate input
    if (!id || !teacher_id) {
      console.error('Invalid request: Missing subject ID or teacher ID');
      return res.status(400).json({ message: 'Invalid request: Missing subject ID or teacher ID' });
    }

    const subject = await Subject.findByPk(id);
    if (!subject) {
      console.error('Subject not found for ID:', id);
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('Subject found:', subject);

    if (subject.teacher_id !== teacher_id) {
      console.error('Unauthorized delete attempt by teacher ID:', teacher_id, 'for subject:', subject);
      return res.status(403).json({ message: 'You can only delete your own subjects.' });
    }

    await subject.destroy();
    console.log('Subject deleted successfully for ID:', id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ message: 'Error deleting subject', error: err.message });
  }
};
