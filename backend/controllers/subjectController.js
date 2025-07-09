const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher'); // Add this at the top

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
    const subjects = await Subject.findAll({
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
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await subject.destroy();
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subject', error: err.message });
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