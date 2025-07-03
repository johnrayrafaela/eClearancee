const express = require('express');
const router = express.Router();
const { register, login , updateProfile} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.put('/:student_id', updateProfile); // Remove '/users' prefix here

module.exports = router;
