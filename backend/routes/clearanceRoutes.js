// In routes/clearanceRoutes.js
const express = require('express');
const router = express.Router();
const clearanceController = require('../controllers/clearanceController');
const User = require('../models/User');
const Clearance = require('../models/Clearance');

// Add association for include to work
Clearance.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

router.post('/create', clearanceController.createClearance);
router.patch('/update-subjects', clearanceController.updateClearanceSubjects);
router.get('/precheck', clearanceController.precheckClearance);
router.get('/status', clearanceController.getClearanceStatus);
router.delete('/delete', clearanceController.deleteClearance);
router.get('/all', clearanceController.getAllClearanceRequests);
router.patch('/:clearance_id/status', clearanceController.updateClearanceStatus);
router.delete('/admin/delete', clearanceController.adminDeleteClearance);
router.get('/analytics/status', clearanceController.getClearanceStatusAnalytics);
router.post('/request-department', clearanceController.requestDepartmentApproval);

router.get('/test', (req, res) => {
  res.send('Clearance test route is working!');
});

module.exports = router;