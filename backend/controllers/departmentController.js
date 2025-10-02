
const Department = require('../models/Department');
const Staff = require('../models/Staff');

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, staff_id } = req.body;
    // Check if staff exists
    const staff = await Staff.findByPk(staff_id);
    if (!staff) {
      return res.status(400).json({ message: 'Staff not found' });
    }
    const department = await Department.create({ name, description, staff_id });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: 'Error creating department', error: err.message });
  }
};

// Get all departments (optionally filter by staff_id)
exports.getDepartments = async (req, res) => {
  try {
    const { staff_id } = req.query;
    const where = {};
    if (staff_id) where.staff_id = staff_id;
    const departments = await Department.findAll({
      where,
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['staff_id', 'firstname', 'lastname', 'email', 'signature']
        }
      ]
    });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching departments', error: err.message });
  }
};

// Get single department
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['staff_id', 'firstname', 'lastname', 'email', 'signature']
        }
      ]
    });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department', error: err.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    const { name, description, staff_id } = req.body;
    if (staff_id) {
      const staff = await Staff.findByPk(staff_id);
      if (!staff) return res.status(400).json({ message: 'Staff not found' });
    }
    await department.update({ name, description, staff_id });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: 'Error updating department', error: err.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    await department.destroy();
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting department', error: err.message });
  }
};

// Get departments for a specific staff
exports.getDepartmentsForStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const departments = await Department.findAll({ where: { staff_id } });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching departments', error: err.message });
  }
};

exports.getDepartmentsByStaff = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const departments = await Department.findAll({ where: { staff_id } });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching departments for staff', error: err.message });
  }
};


// PATCH /api/departments/:id/requirements
exports.updateDepartmentRequirements = async (req, res) => {
  try {
    const { id } = req.params;
    const { requirements } = req.body;
    const department = await Department.findByPk(id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    department.requirements = requirements;
    await department.save();
    res.json({ message: 'Requirements updated', department });
  } catch (err) {
    res.status(500).json({ message: 'Error updating requirements', error: err.message });
  }
};
