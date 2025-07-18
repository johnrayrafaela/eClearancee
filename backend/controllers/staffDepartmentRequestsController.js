const DepartmentStatus = require('../models/DepartmentStatus');
const Department = require('../models/Department');
const User = require('../models/User');

// GET /api/department-status/staff-requests?staff_id=...
exports.getStaffDepartmentRequests = async (req, res) => {
  try {
    const { staff_id } = req.query;
    if (!staff_id) return res.status(400).json({ message: 'Missing staff_id' });
    // Find all departments managed by this staff
    const departments = await Department.findAll({ where: { staff_id } });
    const departmentIds = departments.map(d => d.department_id);
    if (departmentIds.length === 0) return res.json([]);
    // Find all department status requests for these departments
    const { Op } = require('sequelize');
    const requests = await DepartmentStatus.findAll({
      where: { department_id: { [Op.in]: departmentIds } },
      include: [
        { model: Department, as: 'department' },
        { model: User, as: 'student' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department requests', error: err.message });
  }
};

// PATCH /api/department-status/:id/respond
exports.respondToDepartmentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const request = await DepartmentStatus.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;
    await request.save();
    res.json({ message: `Request ${status.toLowerCase()}`, request });
  } catch (err) {
    res.status(500).json({ message: 'Error updating request', error: err.message });
  }
};
