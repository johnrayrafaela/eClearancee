const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { firstname, lastname, email, phone, password, course, year_level, block } = req.body; // <-- add block

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedPassword,
      course,
      year_level,
      block, // <-- save block
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
        block: user.block, // <-- return block
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { student_id } = req.params;
  const { firstname, lastname, email, phone, course, year_level, block } = req.body;

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

    await user.update({ firstname, lastname, email, phone, course, year_level, block });

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
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
