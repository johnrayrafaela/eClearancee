const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
// Serve file directly from uploads directory
router.get('/file/:id', (req, res) => {
  const { file } = req.query;
  if (!file) return res.status(400).json({ message: 'File parameter is required.' });
  
  const fileDir = path.join(__dirname, '../uploads/department-requests');
  const filePath = path.join(fileDir, file);
  
  // Security check: ensure the resolved path is within the uploads directory
  const realDir = path.resolve(fileDir);
  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(realDir)) {
    console.warn('[File Access Denied]', realPath);
    return res.status(403).json({ message: 'Access denied.' });
  }
  
  if (!fs.existsSync(filePath)) {
    console.warn('[File Not Found]', 'Requested:', file, 'Full path:', filePath, 'Exists:', fs.existsSync(fileDir));
    // Check if directory exists
    if (!fs.existsSync(fileDir)) {
      return res.status(404).json({ 
        message: 'Upload directory not found. This may be due to server restart or file deletion.',
        details: `Looking for file: ${file}`
      });
    }
    return res.status(404).json({ 
      message: 'File does not exist on server.',
      details: `The file "${file}" was not found. It may have been deleted or the server may have been reset.`,
      file: file
    });
  }
  
  console.log('[File Served]', file);
  res.download(filePath);
});
router.get('/analytics/student', departmentStatusController.getStudentDepartmentStatusAnalytics);
router.get('/analytics/staff', departmentStatusController.getStaffDepartmentStatusAnalytics);
router.patch('/:id/respond', departmentStatusController.respondDepartmentStatus);

module.exports = router;
