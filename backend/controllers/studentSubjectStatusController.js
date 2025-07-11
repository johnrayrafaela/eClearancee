// Get analytics for teacher: count of Requested, Approved, Rejected per semester
exports.getTeacherSubjectStatusAnalytics = async (req, res) => {
  const { teacher_id } = req.query;
  if (!teacher_id) return res.status(400).json({ message: 'teacher_id is required' });
  try {
    // Get all subjects for this teacher
    const subjects = await Subject.findAll({ where: { teacher_id } });
    const subjectIds = subjects.map(s => s.subject_id);
    if (!subjectIds.length) return res.json({});

    // Get all statuses for these subjects, including semester
    const statuses = await StudentSubjectStatus.findAll({
      where: { subject_id: subjectIds },
      include: [
        { model: Subject, as: 'subject', attributes: ['semester'] }
      ]
    });

    // Build analytics: { '1st': { Requested: n, Approved: n, Rejected: n }, '2nd': {...} }
    const analytics = { '1st': { Requested: 0, Approved: 0, Rejected: 0 }, '2nd': { Requested: 0, Approved: 0, Rejected: 0 } };
    statuses.forEach(s => {
      const sem = s.subject?.semester || '1st';
      if (!analytics[sem]) analytics[sem] = { Requested: 0, Approved: 0, Rejected: 0 };
      if (analytics[sem][s.status] !== undefined) analytics[sem][s.status]++;
    });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teacher analytics', error: err.message });
  }
};
const StudentSubjectStatus = require('../models/StudentSubjectStatus');
const Subject = require('../models/Subject');
const User = require('../models/User');

// Handle subject approval request with multiple file uploads
exports.requestSubjectApproval = async (req, res) => {
  const { student_id, subject_id, requirements } = req.body;
  let file_paths = [];
  if (req.files && req.files.length > 0) {
    file_paths = req.files.map(f => f.filename);
  }
  try {
    let record = await StudentSubjectStatus.findOne({ where: { student_id, subject_id } });
    if (!record) {
      record = await StudentSubjectStatus.create({
        student_id,
        subject_id,
        status: 'Requested',
        requirements: requirements || '',
        file_paths: file_paths.length ? file_paths.join(',') : null
      });
    } else {
      record.status = 'Requested';
      record.requirements = requirements || '';
      if (file_paths.length) record.file_paths = file_paths.join(',');
      await record.save();
    }
    // Always return file_paths as array for frontend compatibility
    const responseRecord = record.toJSON();
    responseRecord.file_paths = responseRecord.file_paths ? responseRecord.file_paths.split(',') : [];
    res.json({ message: 'Approval requested', record: responseRecord });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting approval', error: err.message });
  }
};
// Serve the uploaded file for a subject request
exports.serveUploadedFile = async (req, res) => {
  // Fix: ensure path and fs are imported
  const path = require('path');
  const fs = require('fs');
  const { id } = req.params; // StudentSubjectStatus id
  const { file } = req.query; // file name
  try {
    if (!file) return res.status(400).json({ message: 'File parameter is required.' });
    const fileDir = path.join(__dirname, '../uploads/subject-requests');
    const filePath = path.join(fileDir, file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File does not exist on server.' });
    }
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Error serving file', error: err.message });
  }
};



exports.getRequestsForTeacher = async (req, res) => {
  const { teacher_id, semester } = req.query;
  console.log('teacher_id:', teacher_id); // Add this line
  const subjectWhere = { teacher_id };
  if (semester) subjectWhere.semester = semester;

  try {
    const subjects = await Subject.findAll({ where: subjectWhere });
    const subjectIds = subjects.map(s => s.subject_id);

    // Fetch ALL requests for these subjects, regardless of status
    const requests = await StudentSubjectStatus.findAll({
      where: { subject_id: subjectIds },
      include: [
        { model: User, as: 'student' },
        { model: Subject, as: 'subject' }
      ]
    });
    // Attach requirements and file_paths (as array) to response
    res.json(requests.map(r => {
      const obj = r.toJSON();
      obj.requirements = r.requirements;
      // Support both file_path (legacy) and file_paths (multiple)
      if (obj.file_paths) {
        obj.file_paths = obj.file_paths.split(',').filter(f => f);
      } else if (obj.file_path) {
        obj.file_paths = [obj.file_path];
      } else {
        obj.file_paths = [];
      }
      return obj;
    }));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests', error: err.message });
  }
};

exports.respondToRequest = async (req, res) => {
  const { id } = req.params; // StudentSubjectStatus id
  const { status } = req.body; // 'Approved' or 'Rejected'
  const record = await StudentSubjectStatus.findByPk(id);
  if (!record) return res.status(404).json({ message: 'Request not found' });
  record.status = status;
  await record.save();
  res.json({ message: `Request ${status.toLowerCase()}.`, record });
};

exports.getRequestedStatuses = async (req, res) => {
  const { student_id } = req.query;
  try {
    const statuses = await require('../models/StudentSubjectStatus').findAll({
      where: { student_id },
      attributes: ['subject_id', 'status']
    });
    res.json({ statuses });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subject statuses', error: err.message });
  }
};

exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await require('../models/StudentSubjectStatus').findAll({
      attributes: ['status']
    });
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all subject statuses', error: err.message });
  }
};

// Student analytics: count of Approved, Requested, Pending, Rejected per semester
exports.getStudentSubjectStatusAnalytics = async (req, res) => {
  const { student_id } = req.query;
  if (!student_id) return res.status(400).json({ message: 'student_id is required' });
  try {
    // Get all subject statuses for this student, including semester
    const statuses = await require('../models/StudentSubjectStatus').findAll({
      where: { student_id },
      include: [
        { model: require('../models/Subject'), as: 'subject', attributes: ['semester'] }
      ]
    });
    // Build analytics: { '1st': { Approved: n, Requested: n, Pending: n, Rejected: n, total: n }, '2nd': {...} }
    const analytics = {};
    statuses.forEach(s => {
      const sem = s.subject?.semester || '1st';
      if (!analytics[sem]) analytics[sem] = { Approved: 0, Requested: 0, Pending: 0, Rejected: 0, total: 0 };
      if (analytics[sem][s.status] !== undefined) analytics[sem][s.status]++;
      analytics[sem].total++;
    });
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student analytics', error: err.message });
  }
};