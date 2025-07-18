const DepartmentStatus = require('../models/DepartmentStatus');
const Department = require('../models/Department');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// POST /api/department-status/request
exports.requestDepartmentApproval = async (req, res) => {
  try {
    const { student_id, department_id, semester } = req.body;
    let file_path = null;
    if (req.file) {
      file_path = req.file.filename;
    }
    let record = await DepartmentStatus.findOne({ where: { student_id, department_id, semester } });
    if (!record) {
      record = await DepartmentStatus.create({
        student_id,
        department_id,
        semester,
        status: 'Requested',
        file_path,
      });
    } else {
      record.status = 'Requested';
      if (file_path) record.file_path = file_path;
      await record.save();
    }
    res.json({ message: 'Department approval requested', record });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting department approval', error: err.message });
  }
};

// GET /api/department-status/statuses?student_id=...&semester=...
exports.getDepartmentStatuses = async (req, res) => {
  try {
    const { student_id, semester } = req.query;
    const where = { student_id };
    if (semester) where.semester = semester;
    const statuses = await DepartmentStatus.findAll({ where });
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
