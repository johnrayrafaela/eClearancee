const { Sequelize } = require('sequelize');
const config = require('./config/config.json');

// Create sequelize instance
const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port,
    dialect: config.development.dialect,
    logging: console.log
  }
);

async function updateTeacherIdColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected successfully.');

    // Check current column definition
    const query = `
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Subjects' AND column_name = 'teacher_id';
    `;
    
    const result = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    console.log('Current teacher_id column definition:', result);

    // Update the column to allow NULL
    console.log('Updating teacher_id column to allow NULL...');
    await sequelize.query('ALTER TABLE "Subjects" ALTER COLUMN "teacher_id" DROP NOT NULL;');
    console.log('Column updated successfully!');

    // Verify the change
    const verifyResult = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    console.log('Updated teacher_id column definition:', verifyResult);

    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateTeacherIdColumn();