const { Sequelize } = require('sequelize');
require('dotenv').config();

// Prefer a single full connection string (Neon/Render) if provided.
// Supported variable names: DATABASE_URL or DB_NAME_URL (legacy)
const URL = process.env.DATABASE_URL || process.env.DB_NAME_URL;

let sequelize;

if (URL) {
  // Using full URL form (e.g. Neon)
  sequelize = new Sequelize(URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Neon requires SSL. rejectUnauthorized false to avoid cert issues on some hosts.
      ssl: { require: true, rejectUnauthorized: false }
    }
  });
} else {
  // Fallback to discrete env vars (local dev)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;
