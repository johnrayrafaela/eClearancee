const express = require('express');
const router = express.Router();
const staffDepartmentRequestsController = require('../controllers/staffDepartmentRequestsController');

router.get('/staff-requests', staffDepartmentRequestsController.getStaffDepartmentRequests);
router.patch('/:id/respond', staffDepartmentRequestsController.respondToDepartmentRequest);

module.exports = router;
