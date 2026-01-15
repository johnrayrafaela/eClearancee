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
router.get('/file/:id', (req, res) => {
  const { file } = req.query;
  if (!file) return res.status(400).json({ message: 'File parameter is required.' });
  
  const fileDir = path.join(__dirname, '../uploads/subject-requests');
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
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});

module.exports = router;