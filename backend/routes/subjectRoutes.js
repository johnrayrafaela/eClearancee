// Add subject for teacher
const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
// ...existing code...

// POST /api/subjects/teacher-add

module.exports = router;
router.post('/teacher-add', subjectController.teacherAddSubject);
router.post('/', subjectController.createSubject);
router.get('/', subjectController.getSubjects);
router.get('/student', subjectController.getSubjectsForStudent);
router.get('/teacher/:teacher_id', subjectController.getSubjectsForTeacher);
router.get('/:id', subjectController.getSubject);
router.put('/:id', subjectController.updateSubject);
router.patch('/:subject_id/requirements', subjectController.updateSubjectRequirements);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;