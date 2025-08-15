const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// PATCH /api/subjects/:id/teacher-update
router.patch('/:id/teacher-update', subjectController.teacherUpdateSubject);
// DELETE /api/subjects/:id/teacher-delete
router.delete('/:id/teacher-delete', subjectController.teacherDeleteSubject);

router.post('/teacher-add', subjectController.teacherAddSubject);
router.post('/', subjectController.createSubject);
router.get('/', subjectController.getSubjects);
router.get('/student', subjectController.getSubjectsForStudent);
router.get('/teacher/:teacher_id', subjectController.getSubjectsForTeacher);
router.put('/:id', subjectController.updateSubject);
router.patch('/:subject_id/requirements', subjectController.updateSubjectRequirements);
router.delete('/:id', subjectController.deleteSubject);
router.get('/:id', subjectController.getSubject);

module.exports = router;