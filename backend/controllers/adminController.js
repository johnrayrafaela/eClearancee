const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
exports.registerAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const existing = await Admin.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ firstname, lastname, email, password: hashedPassword });
    res.status(201).json({ message: 'Admin registered', admin: { admin_id: admin.admin_id, firstname, lastname, email } });
  } catch (err) {
    res.status(500).json({ message: 'Error registering admin', error: err.message });
  }
};

// Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin.admin_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      admin: {
        admin_id: admin.admin_id,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ firstname, lastname, email, password: hashedPassword });
    res.status(201).json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Error creating admin', error: err.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admins', error: err.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin', error: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    const { firstname, lastname, email, password } = req.body;
    let updateData = { firstname, lastname, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await admin.update(updateData);
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Error updating admin', error: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    await admin.destroy();
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting admin', error: err.message });
  }
};