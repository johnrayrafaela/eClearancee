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


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admins', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/clearance', clearanceRoutes); 

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
