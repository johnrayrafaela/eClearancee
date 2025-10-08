require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Environment variables (sanitized):');
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('DB_NAME (fallback):', process.env.DB_NAME);

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: console.log,
    }
  );
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Test the teacher_id column issue
    const query = `
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Subjects' AND column_name = 'teacher_id';
    `;
    
    const result = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
    console.log('Current teacher_id column definition:', result);
    
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();