// Gracefully attempt to load .env (Render may already inject env vars and if dotenv isn't installed we don't want to crash)
try {
  require('dotenv').config();
} catch (e) {
  console.warn('[startup] dotenv not loaded (module missing) – continuing with injected environment variables');
}
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/StaffRoutes');
const clearanceRoutes = require('./routes/clearanceRoutes');
const StudentSubjectStatusRoutes = require('./routes/studentSubjectStatusRoutes');

const departmentRoutes = require('./routes/departmentRoutes');

const departmentStatusRoutes = require('./routes/departmentStatusRoutes');
const staffDepartmentRequestsRoutes = require('./routes/staffDepartmentRequestsRoutes');


//associations
const StudentSubjectStatus = require('./models/StudentSubjectStatus');
const Staff = require('./models/Staff');
const Department = require('./models/Department');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Subject = require('./models/Subject');
const DepartmentStatus = require('./models/DepartmentStatus');
// (Removed duplicate StudentSubjectStatus require to prevent Identifier redeclaration)




DepartmentStatus.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
DepartmentStatus.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Department.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });
Department.hasMany(require('./models/DepartmentStatus'), { foreignKey: 'department_id', as: 'statuses' });
Staff.hasMany(Department, { foreignKey: 'staff_id', as: 'departments' });
Subject.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Subject, { foreignKey: 'department_id' });



Teacher.hasMany(Subject, { foreignKey: 'teacher_id' });
Subject.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
// Add reverse association with cascade for student subject statuses to allow subject deletion
if (!Subject.associations.studentStatuses) {
  Subject.hasMany(StudentSubjectStatus, {
    foreignKey: 'subject_id',
    as: 'studentStatuses',
    onDelete: 'CASCADE',
    hooks: true
  });
}

StudentSubjectStatus.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
StudentSubjectStatus.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

const app = express();

app.use(cors());
app.use(express.json());

// Basic request logger (can remove later)
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/admins', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/clearance', clearanceRoutes); 
app.use('/api/student-subject-status', StudentSubjectStatusRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/department-status', departmentStatusRoutes);
app.use('/api/department-status', staffDepartmentRequestsRoutes);
app.use('/api/subject', require('./routes/subjectRoutes'));

// Serve uploaded files (signatures/avatars) if stored locally
try {
  const path = require('path');
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} catch (e) {
  // optional; ignore if path not present
}

// Basic health check for Render/Vercel uptime checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 5000;

// In production we avoid destructive/alter migrations automatically.
// Use migrations (recommended) or run a one-time sync without alter.
const isProd = process.env.NODE_ENV === 'production';
const syncOptions = isProd ? {} : { alter: true };

sequelize.sync(syncOptions).then(() => {
  console.log('Database connected' + (isProd ? '' : ' (dev alter sync applied)'));
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to DB:', err);
  process.exit(1);
});
