const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);

router.post('/', teacherController.createTeacher);
router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
