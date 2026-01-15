const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const StudentSubjectStatus = require('../models/StudentSubjectStatus');
const Clearance = require('../models/Clearance'); // If you have this model

exports.register = async (req, res) => {
  let { firstname, lastname, email, phone, password, course, year_level, block, signature } = req.body;
  // Basic normalization
  email = (email || '').trim().toLowerCase();
  firstname = firstname?.trim();
  lastname = lastname?.trim();

  try {
  // Check if email exists in ANY user table (students, teachers, staff)
    const existingUser = await User.findOne({ where: { email } });
    const existingTeacher = await Teacher.findOne({ where: { email } });
    const existingStaff = await Staff.findOne({ where: { email } });
    
    if (existingUser || existingTeacher || existingStaff) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      course,
      year_level,
      block,
      signature: signature || null,
    });

    res.status(201).json({
      message: 'User registered',
      user: {
        student_id: user.student_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        course: user.course,
        year_level: user.year_level,
        block: user.block,
        signature: user.signature,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.login = async (req, res) => {
  let { email, password } = req.body;
  email = (email || '').trim().toLowerCase();
  password = password || '';

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use correct primary key field (student_id) instead of user.id (undefined in this model)
    const token = jwt.sign(
      { student_id: user.student_id, role: 'student' },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '4h' }
    );

    res.json({
      token,
      user: {
        student_id: user.student_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        course: user.course,
        year_level: user.year_level,
        block: user.block, // <-- return block
        signature: user.signature,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { student_id } = req.params;
  const { firstname, lastname, email, phone, course, year_level, block, password } = req.body;

  try {
    const user = await User.findByPk(student_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    let updateFields = { firstname, lastname, email, phone, course, year_level, block };
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateFields);

    res.json({
      message: 'Profile updated successfully',
      user: {
        student_id: user.student_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        course: user.course,
        year_level: user.year_level,
        block: user.block,
        signature: user.signature,
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll();
    res.json(students);
  } catch (err) {
    console.error('Get all students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single student by ID
exports.getStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await User.findByPk(id);
    if (!student) return res.status(404).json({ message: 'User not found' });
    res.json(student);
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a student by ID
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await User.findByPk(id);
    if (!student) return res.status(404).json({ message: 'User not found' });

    // Delete related StudentSubjectStatus records
    await StudentSubjectStatus.destroy({ where: { student_id: id } });

    // Delete related Clearance records
    await Clearance.destroy({ where: { student_id: id } });

    // Delete related DepartmentStatus records
    const DepartmentStatus = require('../models/DepartmentStatus');
    await DepartmentStatus.destroy({ where: { student_id: id } });

    await student.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
