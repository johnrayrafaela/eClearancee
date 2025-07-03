const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Staff
exports.registerStaff = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const existing = await Staff.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await Staff.create({ firstname, lastname, email, password: hashedPassword });
    res.status(201).json({ message: 'Staff registered', staff: { staff_id: staff.staff_id, firstname, lastname, email } });
  } catch (err) {
    res.status(500).json({ message: 'Error registering staff', error: err.message });
  }
};

// Login Staff
exports.loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: staff.staff_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      staff: {
        staff_id: staff.staff_id,
        firstname: staff.firstname,
        lastname: staff.lastname,
        email: staff.email,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Get all staff
exports.getStaffs = async (req, res) => {
  try {
    const staffs = await Staff.findAll();
    res.json(staffs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// Get single staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    const { firstname, lastname, email, password } = req.body;
    let updateData = { firstname, lastname, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await staff.update(updateData);
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error updating staff', error: err.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    await staff.destroy();
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting staff', error: err.message });
  }
};