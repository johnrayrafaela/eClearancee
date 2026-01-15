const DepartmentStatus = require('../models/DepartmentStatus');
const Department = require('../models/Department');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// POST /api/department-status/request
exports.requestDepartmentApproval = async (req, res) => {
  try {
  const { student_id, department_id, semester, requirements, link, checklist } = req.body;
  let file_path = null;
  let submittedLink = null;
  let submittedChecklist = null;
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

    // Determine structured requirement type if JSON
    let deptRequirements = requirements;
    if (typeof deptRequirements !== 'string') deptRequirements = '';
    let parsedReq = null;
    try { parsedReq = JSON.parse(deptRequirements); } catch { /* ignore */ }
    const reqType = parsedReq?.type || 'Text';

    if (reqType === 'Link') {
      if (!link || !/^https?:\/\//.test(link)) {
        return res.status(400).json({ message: 'Valid link is required for Link requirement type.' });
      }
      submittedLink = link;
    } else if (reqType === 'Checklist') {
      // checklist expected as JSON array of booleans (or convertible)
      if (!checklist) {
        return res.status(400).json({ message: 'Checklist completion array is required for Checklist requirement type.' });
      }
      try {
        const arr = Array.isArray(checklist) ? checklist : JSON.parse(checklist);
        if (!Array.isArray(arr)) throw new Error('Not array');
        submittedChecklist = JSON.stringify(arr.map(v => !!v));
      } catch {
        return res.status(400).json({ message: 'Invalid checklist format.' });
      }
    } else if (reqType === 'File' || reqType === 'Text' || reqType === 'Other') {
      if (reqType === 'File' || reqType === 'Text' || reqType === 'Other') {
        if (!req.file) {
          return res.status(400).json({ message: 'File is required for this requirement type.' });
        }
        file_path = req.file.filename;
      }
    } else {
      // Default treat as file-based
      if (req.file) file_path = req.file.filename;
    }
    const status = 'Requested';
    const newStatus = await DepartmentStatus.create({ 
      student_id, department_id, semester, status, file_path, requirements: deptRequirements, link: submittedLink, checklist: submittedChecklist, remarks: null 
    });
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
      ],
  attributes: ['id','student_id','department_id','semester','status','file_path','requirements','link','checklist','remarks','createdAt']
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
    
    // Security check: ensure the resolved path is within the uploads directory
    const realDir = path.resolve(fileDir);
    const realPath = path.resolve(filePath);
    if (!realPath.startsWith(realDir)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    if (!fs.existsSync(filePath)) {
      // Try to find it in the database to provide better error message
      const DepartmentStatus = require('../models/DepartmentStatus');
      const record = await DepartmentStatus.findByPk(id);
      if (record && record.file_path) {
        return res.status(404).json({ message: `File "${record.file_path}" does not exist on server. It may have been deleted or the upload failed.` });
      }
      return res.status(404).json({ message: 'File does not exist on server.' });
    }
    
    res.download(filePath);
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

// GET /api/department-status/analytics/staff?staff_id=...
// Aggregates statuses for departments owned by a particular staff member.
// Returns: { '1st': { Requested, Approved, Rejected }, '2nd': { ... } }
exports.getStaffDepartmentStatusAnalytics = async (req, res) => {
  const { staff_id } = req.query;
  if (!staff_id) return res.status(400).json({ message: 'staff_id is required' });
  try {
    // Find all departments belonging to this staff
    const departments = await require('../models/Department').findAll({ where: { staff_id } });
    const deptIds = departments.map(d => d.department_id);
    if (!deptIds.length) {
      return res.json({ '1st': { Requested: 0, Approved: 0, Rejected: 0 }, '2nd': { Requested: 0, Approved: 0, Rejected: 0 } });
    }
    const statuses = await DepartmentStatus.findAll({ where: { department_id: deptIds } });
    const analytics = { '1st': { Requested: 0, Approved: 0, Rejected: 0 }, '2nd': { Requested: 0, Approved: 0, Rejected: 0 } };
    statuses.forEach(s => {
      const sem = s.semester === '2nd' ? '2nd' : '1st';
      if (analytics[sem][s.status] !== undefined) analytics[sem][s.status]++;
    });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff department analytics', error: err.message });
  }
};

// PATCH /api/department-status/:id/respond  (shared simple handler if staff uses this base controller)
exports.respondDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const record = await DepartmentStatus.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Request not found' });
    record.status = status;
    if (status === 'Rejected') {
      record.remarks = remarks?.trim() || null;
    } else if (status === 'Approved') {
      record.remarks = null;
    }
    await record.save();
    res.json({ message: `Request ${status.toLowerCase()}.`, record });
  } catch (err) {
    res.status(500).json({ message: 'Error updating department status', error: err.message });
  }
};
