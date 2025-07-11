const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getAllStudents, getStudent, deleteStudent } = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.put('/:student_id', updateProfile); // Remove '/users' prefix here
router.get('/getAll/students', getAllStudents);
router.get('/get/:id', getStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
