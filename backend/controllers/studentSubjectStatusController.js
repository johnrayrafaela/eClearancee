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
  const { teacher_id } = req.query;
  console.log('teacher_id:', teacher_id); // Add this line
  try {
    const subjects = await Subject.findAll({ where: { teacher_id } });
    const subjectIds = subjects.map(s => s.subject_id);

    const requests = await StudentSubjectStatus.findAll({
      where: { subject_id: subjectIds, status: 'Requested' },
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