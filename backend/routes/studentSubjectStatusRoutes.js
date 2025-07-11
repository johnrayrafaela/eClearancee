const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentSubjectStatusController');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/subject-requests'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ensure upload directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/subject-requests');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use multer for file upload on request
router.post('/request', upload.array('files'), ctrl.requestSubjectApproval);
router.get('/teacher', ctrl.getRequestsForTeacher);
router.patch('/:id/respond', ctrl.respondToRequest);
router.get('/requested-statuses', ctrl.getRequestedStatuses);
router.get('/all-statuses', ctrl.getAllStatuses);
router.get('/analytics/teacher', ctrl.getTeacherSubjectStatusAnalytics);
router.get('/analytics/student', ctrl.getStudentSubjectStatusAnalytics);

// Serve uploaded file for a request
router.get('/file/:id', ctrl.serveUploadedFile);

module.exports = router;