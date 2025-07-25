require('dotenv').config();
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




DepartmentStatus.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
DepartmentStatus.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Department.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });
Department.hasMany(require('./models/DepartmentStatus'), { foreignKey: 'department_id', as: 'statuses' });
Staff.hasMany(Department, { foreignKey: 'staff_id', as: 'departments' });
Subject.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Subject, { foreignKey: 'department_id' });



Teacher.hasMany(Subject, { foreignKey: 'teacher_id' });
Subject.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

StudentSubjectStatus.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
StudentSubjectStatus.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database connected and tables updated');
  console.log('OpenAI Key Loaded:', process.env.OPENAI_API_KEY?.slice(0, 8));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to DB:', err);
});
