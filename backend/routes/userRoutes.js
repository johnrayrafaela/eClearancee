const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getAllStudents, getStudent, deleteStudent } = require('../controllers/userController');

// Auth & profile
router.post('/register', register);
router.post('/login', login);
router.put('/:student_id', updateProfile);

// Collections & retrieval
// Added GET / to support dashboard aggregate fetches
router.get('/', getAllStudents);
router.get('/getAll/students', getAllStudents); // legacy path still supported
router.get('/get/:id', getStudent);

// Deletion
router.delete('/:id', deleteStudent);

module.exports = router;
