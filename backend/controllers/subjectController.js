// PATCH /api/subjects/:id/teacher-update
exports.teacherUpdateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id, name, course, year_level, semester, requirements } = req.body;
    const subject = await Subject.findByPk(id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.teacher_id !== teacher_id) {
      return res.status(403).json({ message: 'You can only update your own subjects.' });
    }
    await subject.update({ name, course, year_level, semester, requirements });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subject', error: err.message });
  }
};

// DELETE /api/subjects/:id/teacher-delete
exports.teacherDeleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id } = req.body;

    console.log('Delete request received for subject ID:', id, 'by teacher ID:', teacher_id);

    // Validate input
    if (!id || !teacher_id) {
      console.error('Invalid request: Missing subject ID or teacher ID');
      return res.status(400).json({ message: 'Invalid request: Missing subject ID or teacher ID' });
    }

    const subject = await Subject.findByPk(id);
    if (!subject) {
      console.error('Subject not found for ID:', id);
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('Subject found:', subject.toJSON());
    console.log('Comparing teacher IDs - Subject teacher_id:', subject.teacher_id, 'Request teacher_id:', teacher_id);

    // Convert both to numbers for comparison
    if (parseInt(subject.teacher_id) !== parseInt(teacher_id)) {
      console.error('Unauthorized delete attempt by teacher ID:', teacher_id, 'for subject owned by:', subject.teacher_id);
      return res.status(403).json({ message: 'You can only delete your own subjects.' });
    }

    // First, delete related StudentSubjectStatus records to avoid foreign key constraint violation
    const StudentSubjectStatus = require('../models/StudentSubjectStatus');
    const deletedStatuses = await StudentSubjectStatus.destroy({ 
      where: { subject_id: id } 
    });
    console.log(`Deleted ${deletedStatuses} StudentSubjectStatus records for subject ID: ${id}`);

    // Now delete the subject
    await subject.destroy();
    console.log('Subject deleted successfully for ID:', id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ message: 'Error deleting subject', error: err.message });
  }
};

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
      requirements: requirements ?? '',
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
    
    // If teacher_id is provided, check if teacher exists
    if (teacher_id) {
      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(400).json({ message: 'Teacher not found' });
      }
    }
    
    const subject = await Subject.create({ 
      name, 
      description, 
      course, 
      year_level, 
      semester, 
      teacher_id: teacher_id || null // Allow null teacher_id for admin-created subjects
    });
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

// Get unclaimed subjects (subjects without teacher_id)
exports.getUnclaimedSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      where: { teacher_id: null }
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unclaimed subjects', error: err.message });
  }
};

// Claim a subject by a teacher (creates a duplicate with teacher assigned)
exports.claimSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id } = req.body;

    console.log('Claim request received for subject ID:', id, 'by teacher ID:', teacher_id);

    // Validate input
    if (!id || !teacher_id) {
      return res.status(400).json({ message: 'Invalid request: Missing subject ID or teacher ID' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(400).json({ message: 'Teacher not found' });
    }

    const originalSubject = await Subject.findByPk(id);
    if (!originalSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if the original subject is admin-created (teacher_id is null)
    if (originalSubject.teacher_id !== null) {
      return res.status(400).json({ message: 'This subject is already claimed by a teacher. You can only claim admin-created subjects.' });
    }

    // Check if this teacher has already claimed this subject
    const existingClaim = await Subject.findOne({
      where: {
        name: originalSubject.name,
        course: originalSubject.course,
        year_level: originalSubject.year_level,
        semester: originalSubject.semester,
        teacher_id: teacher_id
      }
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already claimed this subject.' });
    }

    // Create a duplicate subject for this teacher (keep original admin subject intact)
    const claimedSubject = await Subject.create({
      name: originalSubject.name,
      description: originalSubject.description,
      course: originalSubject.course,
      year_level: originalSubject.year_level,
      semester: originalSubject.semester,
      teacher_id: teacher_id,
      requirements: originalSubject.requirements || ''
    });

    console.log('Subject claimed successfully - Created duplicate with ID:', claimedSubject.subject_id, 'for teacher ID:', teacher_id);
    console.log('Original admin subject remains available for other teachers');
    
    res.json({ 
      message: 'Subject claimed successfully', 
      subject: claimedSubject,
      note: 'A copy of the subject has been created for you. Other teachers can still claim this subject.'
    });
  } catch (err) {
    console.error('Error claiming subject:', err);
    res.status(500).json({ message: 'Error claiming subject', error: err.message });
  }
};

// Unclaim a subject by a teacher (delete teacher's claimed copy)
exports.unclaimSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id } = req.body;

    console.log('Unclaim request received for subject ID:', id, 'by teacher ID:', teacher_id);

    // Validate input
    if (!id || !teacher_id) {
      return res.status(400).json({ message: 'Invalid request: Missing subject ID or teacher ID' });
    }

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('Subject found:', subject.toJSON());

    // Check if this is the teacher's claimed subject
    if (parseInt(subject.teacher_id) !== parseInt(teacher_id)) {
      return res.status(403).json({ message: 'You can only unclaim your own subjects.' });
    }

    // Check if this is an admin-created subject (shouldn't be unclaimed, only deleted)
    if (subject.teacher_id === null) {
      return res.status(400).json({ message: 'Cannot unclaim admin-created subjects. Use delete instead.' });
    }

    // Check if there are any student submissions for this subject
    const StudentSubjectStatus = require('../models/StudentSubjectStatus');
    const studentSubmissions = await StudentSubjectStatus.findAll({ 
      where: { subject_id: id } 
    });

    if (studentSubmissions.length > 0) {
      // Delete related StudentSubjectStatus records first
      await StudentSubjectStatus.destroy({ where: { subject_id: id } });
      console.log(`Deleted ${studentSubmissions.length} student submissions for subject ID: ${id}`);
    }

    // Delete the teacher's claimed subject copy
    await subject.destroy();
    console.log('Subject unclaimed successfully - Teacher copy deleted for ID:', id);
    
    res.json({ 
      message: 'Subject unclaimed successfully',
      note: 'Your copy of the subject has been removed. The original subject remains available for other teachers to claim.'
    });
  } catch (err) {
    console.error('Error unclaiming subject:', err);
    res.status(500).json({ message: 'Error unclaiming subject', error: err.message });
  }
};