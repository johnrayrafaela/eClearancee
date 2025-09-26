require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = require('./config/config');

async function checkSubjects() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    // Check all subjects and their teacher assignments
    const allSubjects = await sequelize.query(
      'SELECT subject_id, name, course, year_level, semester, teacher_id FROM "Subjects" ORDER BY subject_id;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('\n=== ALL SUBJECTS IN DATABASE ===');
    allSubjects.forEach(subject => {
      const status = subject.teacher_id === null ? 'UNCLAIMED (Admin)' : `CLAIMED by Teacher ${subject.teacher_id}`;
      console.log(`ID: ${subject.subject_id} | ${subject.name} - ${subject.course} ${subject.year_level} ${subject.semester} | ${status}`);
    });

    // Check unclaimed subjects (should be available to all teachers)
    const unclaimedSubjects = await sequelize.query(
      'SELECT subject_id, name, course, year_level, semester FROM "Subjects" WHERE teacher_id IS NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('\n=== UNCLAIMED SUBJECTS (Available for claiming) ===');
    if (unclaimedSubjects.length === 0) {
      console.log('No unclaimed subjects found!');
    } else {
      unclaimedSubjects.forEach(subject => {
        console.log(`ID: ${subject.subject_id} | ${subject.name} - ${subject.course} ${subject.year_level} ${subject.semester}`);
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSubjects();