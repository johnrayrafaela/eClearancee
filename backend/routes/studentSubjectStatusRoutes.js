const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentSubjectStatusController');


router.post('/request', ctrl.requestSubjectApproval);
router.get('/teacher', ctrl.getRequestsForTeacher);
router.patch('/:id/respond', ctrl.respondToRequest);
router.get('/requested-statuses', ctrl.getRequestedStatuses);

module.exports = router;