
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher'); // Add this at the top

// POST /api/subjects/teacher-add
exports.teacherAddSubject = async (req, res) => {
  try {
    const { name, semester, teacher_id, requirements, course, year_level } = req.body;
    if (!name || !semester || !teacher_id || !course || !year_level) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const subject = await Subject.create({
      name,
      semester,
      teacher_id,
      requirements: requirements || '',
      course,
      year_level
    });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error adding subject', error: err.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, description, course, year_level, semester, teacher_id } = req.body;
    // Check if teacher exists
    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(400).json({ message: 'Teacher not found' });
    }
    const subject = await Subject.create({ name, description, course, year_level, semester, teacher_id });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error creating subject', error: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const { semester } = req.query; // get semester from query
    const where = {};
    if (semester) where.semester = semester; // filter if provided

    const subjects = await Subject.findAll({
      where,
      include: [
        {
          model: require('../models/Teacher'),
          as: 'teacher',
          attributes: ['teacher_id', 'firstname', 'lastname', 'email']
        }
      ]
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects', error: err.message });
  }
};

exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subject', error: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const { name, description, course, year_level, semester, teacher_id } = req.body;
    await subject.update({ name, description, course, year_level, semester, teacher_id });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subject', error: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    await subject.destroy();
    res.status(200).json({ message: 'Subject deleted' });
  } catch (err) {
    console.error(err);  // Check terminal logs for the real cause
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getSubjectsForStudent = async (req, res) => {
  const { course, year_level, semester } = req.query;
  try {
    const where = { course, year_level };
    if (semester) where.semester = semester;
    const subjects = await Subject.findAll({ where });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects', error: err.message });
  }
};

exports.getSubjectsForTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const subjects = await Subject.findAll({ where: { teacher_id } });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subjects', error: err.message });
  }
};

exports.updateSubjectRequirements = async (req, res) => {
  try {
    const { subject_id } = req.params;
    const { requirements } = req.body;
    const subject = await Subject.findByPk(subject_id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    subject.requirements = requirements;
    await subject.save();
    res.json({ message: 'Requirements updated', subject });
  } catch (err) {
    res.status(500).json({ message: 'Error updating requirements', error: err.message });
  }
};