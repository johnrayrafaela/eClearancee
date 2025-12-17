const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminOnly } = require('../middleware/auth');

router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
// protect subsequent admin-only routes
router.use(adminOnly);

router.get('/', adminController.getAdmins);
router.get('/:id', adminController.getAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;