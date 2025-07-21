const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const departmentStatusController = require('../controllers/departmentStatusController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/department-requests'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });
router.get('/all-statuses', departmentStatusController.getAllDepartmentStatuses);
router.post('/request', upload.single('file'), departmentStatusController.requestDepartmentApproval);
router.get('/statuses', departmentStatusController.getDepartmentStatuses);
router.get('/file/:id', departmentStatusController.serveUploadedFile);
router.get('/analytics/student', departmentStatusController.getStudentDepartmentStatusAnalytics);

module.exports = router;
