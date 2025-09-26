const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

// PATCH /api/subjects/:id/teacher-update
router.patch('/:id/teacher-update', subjectController.teacherUpdateSubject);
// DELETE /api/subjects/:id/teacher-delete
router.delete('/:id/teacher-delete', subjectController.teacherDeleteSubject);
// GET /api/subjects/unclaimed - Get subjects without teachers
router.get('/unclaimed', subjectController.getUnclaimedSubjects);
// PATCH /api/subjects/:id/claim - Claim a subject by teacher
router.patch('/:id/claim', subjectController.claimSubject);
// DELETE /api/subjects/:id/unclaim - Unclaim a subject by teacher
router.delete('/:id/unclaim', subjectController.unclaimSubject);

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