const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.post('/register', staffController.registerStaff);
router.post('/login', staffController.loginStaff);
router.get('/', staffController.getStaffs);
router.get('/:id', staffController.getStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;