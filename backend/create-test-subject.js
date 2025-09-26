require('dotenv').config();
const sequelize = require('./config/config');

async function createTestAdminSubject() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully.');

    // Create a test admin subject
    const result = await sequelize.query(`
      INSERT INTO "Subjects" (name, description, course, year_level, semester, teacher_id, requirements, "createdAt", "updatedAt")
      VALUES ('Mathematics', 'Basic Mathematics Course', 'BSIT', '1st Year', '1st', NULL, '', NOW(), NOW())
      RETURNING subject_id, name, course, year_level, semester, teacher_id;
    `);

    console.log('Test admin subject created:', result[0][0]);

    // Verify it's created correctly
    const unclaimedSubjects = await sequelize.query(
      'SELECT subject_id, name, course, year_level, semester, teacher_id FROM "Subjects" WHERE teacher_id IS NULL;',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nUnclaimed subjects now available:');
    unclaimedSubjects.forEach(subject => {
      console.log(`ID: ${subject.subject_id} | ${subject.name} - ${subject.course} ${subject.year_level} ${subject.semester}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestAdminSubject();