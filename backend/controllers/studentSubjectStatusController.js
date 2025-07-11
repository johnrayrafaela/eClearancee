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

exports.requestSubjectApproval = async (req, res) => {
  const { student_id, subject_id } = req.body;
  try {
    let record = await StudentSubjectStatus.findOne({ where: { student_id, subject_id } });
    if (!record) {
      record = await StudentSubjectStatus.create({ student_id, subject_id, status: 'Requested' });
    } else {
      record.status = 'Requested';
      await record.save();
    }
    res.json({ message: 'Approval requested', record });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting approval', error: err.message });
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
    res.json(requests);
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