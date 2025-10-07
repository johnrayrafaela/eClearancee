const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Department = require('../models/Department');
const DepartmentStatus = require('../models/DepartmentStatus');

// Register Staff
exports.registerStaff = async (req, res) => {
  try {
    let { firstname, lastname, email, password, signature } = req.body;
    email = (email || '').trim().toLowerCase();
    firstname = firstname?.trim();
    lastname = lastname?.trim();
    const existing = await Staff.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await Staff.create({ firstname, lastname, email, password: hashedPassword, signature: signature || null });
    res.status(201).json({ message: 'Staff registered', staff: { staff_id: staff.staff_id, firstname, lastname, email, signature: staff.signature } });
  } catch (err) {
    res.status(500).json({ message: 'Error registering staff', error: err.message });
  }
};

// Login Staff
exports.loginStaff = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = (email || '').trim().toLowerCase();
    password = password || '';
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ staff_id: staff.staff_id, role: 'staff' }, process.env.JWT_SECRET || 'changeme', { expiresIn: '4h' });
    res.json({
      token,
      staff: {
        staff_id: staff.staff_id,
        firstname: staff.firstname,
        lastname: staff.lastname,
        email: staff.email,
        signature: staff.signature,
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

// Delete staff (guard against FK issues)
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Check for departments assigned to this staff
    const departments = await Department.findAll({ where: { staff_id: id }, attributes:['department_id','name'] });
    if (departments.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete staff: staff is assigned to departments. Reassign or delete those departments first.',
        blockingDepartments: departments
      });
    }

    await staff.destroy();
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error('Delete staff error:', err);
    res.status(500).json({ message: 'Error deleting staff', error: err.message });
  }
};