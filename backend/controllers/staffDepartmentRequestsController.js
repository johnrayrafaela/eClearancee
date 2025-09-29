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
        { model: Department, as: 'department', attributes: ['department_id','name'] },
        { model: User, as: 'student', attributes: ['student_id','firstname','lastname','course','year_level','block'] }
      ],
      attributes: ['id','student_id','department_id','semester','status','file_path','requirements','remarks','createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department requests', error: err.message });
  }
};

// PATCH /api/department-status/:id/respond (with optional remarks on rejection)
exports.respondToDepartmentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const request = await DepartmentStatus.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;
    if (status === 'Rejected') {
      request.remarks = (remarks && remarks.trim()) ? remarks.trim() : null;
    } else if (status === 'Approved') {
      // Clear remarks on approval to avoid stale feedback
      request.remarks = null;
    }
    await request.save();
    res.json({ message: `Request ${status.toLowerCase()}`, request });
  } catch (err) {
    res.status(500).json({ message: 'Error updating request', error: err.message });
  }
};
