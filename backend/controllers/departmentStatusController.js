const DepartmentStatus = require('../models/DepartmentStatus');
const Department = require('../models/Department');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// POST /api/department-status/request
exports.requestDepartmentApproval = async (req, res) => {
  try {
    const { student_id, department_id, semester, requirements } = req.body;
    let file_path = null;
    // Only one request per student per department per semester, unless previous is rejected
    const existing = await DepartmentStatus.findOne({ where: { student_id, department_id, semester } });
    if (existing) {
      if (existing.status === 'Rejected') {
        // Allow re-request: delete old rejected status
        await existing.destroy();
      } else {
        return res.status(400).json({ message: 'Already requested' });
      }
    }

    // Get requirements from Department model if not provided
    let deptRequirements = requirements;
    if (typeof deptRequirements !== 'string') deptRequirements = '';
    if (deptRequirements.trim() === '') {
      // If requirements are empty, file is optional
      if (req.file) file_path = req.file.filename;
    } else {
      // If requirements are present, file is required
      if (!req.file) {
        return res.status(400).json({ message: 'File is required for departments with requirements.' });
      }
      file_path = req.file.filename;
    }
    const status = 'Requested';
    const newStatus = await DepartmentStatus.create({ student_id, department_id, semester, status, file_path, requirements: deptRequirements });
    res.json(newStatus);
  } catch (err) {
    res.status(500).json({ message: 'Error requesting department approval', error: err.message });
  }
};

// GET /api/department-status/statuses?student_id=...&semester=...
exports.getDepartmentStatuses = async (req, res) => {
  try {
    const { student_id, semester } = req.query;
    const statuses = await DepartmentStatus.findAll({
      where: { student_id, semester },
      include: [
        {
          model: Department,
          as: 'department',
          include: [
            {
              model: require('../models/Staff'),
              as: 'staff',
              attributes: ['staff_id', 'firstname', 'lastname', 'email']
            }
          ]
        }
      ]
    });
    res.json({ statuses });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department statuses', error: err.message });
  }
};

// GET /api/department-status/all-statuses
exports.getAllDepartmentStatuses = async (req, res) => {
  try {
    const statuses = await DepartmentStatus.findAll();
    const counts = { Pending: 0, Requested: 0, Approved: 0, Rejected: 0 };
    statuses.forEach(s => {
      if (counts[s.status] !== undefined) counts[s.status]++;
    });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department statuses', error: err.message });
  }
};

// Serve uploaded file
exports.serveUploadedFile = async (req, res) => {
  const { id } = req.params;
  const { file } = req.query;
  try {
    if (!file) return res.status(400).json({ message: 'File parameter is required.' });
    const fileDir = path.join(__dirname, '../uploads/department-requests');
    const filePath = path.join(fileDir, file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File does not exist on server.' });
    }
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Error serving file', error: err.message });
  }
};

// GET /api/department-status/analytics/student?student_id=...
exports.getStudentDepartmentStatusAnalytics = async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ message: 'student_id is required' });
  try {
    const statuses = await require('../models/DepartmentStatus').findAll({
      where: { student_id }
    });
    // Always include both semesters
    const analytics = {
      '1st': { Approved: 0, Requested: 0, Pending: 0, Rejected: 0, total: 0 },
      '2nd': { Approved: 0, Requested: 0, Pending: 0, Rejected: 0, total: 0 }
    };
    statuses.forEach(s => {
      const sem = s.semester === '2nd' ? '2nd' : '1st'; // default to '1st' if not set
      if (analytics[sem][s.status] !== undefined) analytics[sem][s.status]++;
      analytics[sem].total++;
    });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department analytics', error: err.message });
  }
};
