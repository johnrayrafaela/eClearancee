"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Remove duplicate rows keeping the most recent (highest id) per (student_id, subject_id, semester)
    // Postgres-specific window function usage
    await queryInterface.sequelize.query(`
      WITH ranked AS (
        SELECT id, student_id, subject_id, semester,
               ROW_NUMBER() OVER (PARTITION BY student_id, subject_id, COALESCE(semester,'__NULL__') ORDER BY id DESC) AS rn
        FROM "StudentSubjectStatuses"
      )
      DELETE FROM "StudentSubjectStatuses" s
      USING ranked r
      WHERE s.id = r.id AND r.rn > 1;
    `);

    // 2. Add a unique index / constraint on (student_id, subject_id, semester)
    // Note: semester can be NULL; Postgres allows multiple NULLs. If needed, ensure semester always provided by app layer.
    await queryInterface.addConstraint('StudentSubjectStatuses', {
      fields: ['student_id', 'subject_id', 'semester'],
      type: 'unique',
      name: 'student_subject_semester_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('StudentSubjectStatuses', 'student_subject_semester_unique');
  }
};
