// Simple seed script to populate initial admin / sample data on a fresh Neon database.
// Run manually: node seed.js  (DO NOT run automatically in production deploys)
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/config');
const Admin = require('./models/Admin');
const Teacher = require('./models/Teacher');
const Staff = require('./models/Staff');
const User = require('./models/User');
const Subject = require('./models/Subject');

async function seed() {
  try {
    console.log('Checking DB connection...');
    await sequelize.authenticate();
    console.log('DB connected. Syncing (non-destructive)...');
    await sequelize.sync();

    // Upsert style seeding
    const passwordHash = await bcrypt.hash('admin123', 10);
    const [admin] = await Admin.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: { firstname: 'System', lastname: 'Admin', password: passwordHash }
    });
    console.log('Admin ready:', admin.email);

    const commonPass = await bcrypt.hash('password123', 10);
    const [teacher] = await Teacher.findOrCreate({
      where: { email: 'teacher1@example.com' },
      defaults: { firstname: 'Alice', lastname: 'Teacher', password: commonPass }
    });
    const [staff] = await Staff.findOrCreate({
      where: { email: 'staff1@example.com' },
      defaults: { firstname: 'Bob', lastname: 'Staff', password: commonPass }
    });
    const [student] = await User.findOrCreate({
      where: { email: 'student1@example.com' },
      defaults: { firstname: 'Charlie', lastname: 'Student', password: commonPass, course: 'BSIT', year_level: '1st Year', block: 'A' }
    });

    const [subject] = await Subject.findOrCreate({
      where: { name: 'Intro to Programming', course: 'BSIT', year_level: '1st Year', semester: '1st' },
      defaults: { description: 'Basics of coding', teacher_id: teacher.teacher_id }
    });

    console.log('Seed complete. Entities created/ensured: admin, teacher, staff, student, sample subject.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();