// controllers/clearanceController.js (clean version with signature support)
const User = require('../models/User');
const Subject = require('../models/Subject');
const Clearance = require('../models/Clearance');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Helper to attach first status only
function flattenSubjectStatuses(subjects) {
  return subjects.map(sub => {
    const plain = sub.toJSON();
    if (Array.isArray(plain.StudentSubjectStatus) && plain.StudentSubjectStatus.length) {
      plain.StudentSubjectStatus = plain.StudentSubjectStatus[0];
    } else if (!plain.StudentSubjectStatus) {
      plain.StudentSubjectStatus = null;
    }
    return plain;
  });
}

exports.getStudentClearanceInfo = async (req, res) => {
  try {
    const student_id = req.user?.student_id || req.query.student_id;
    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const subjects = await Subject.findAll({ where: { course: student.course, year_level: student.year_level } });
    res.json({
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createClearance = async (req, res) => {
  try {
    const { student_id, semester, subject_ids } = req.body;
    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const existing = await Clearance.findOne({ where: { student_id, semester } });
    if (existing) return res.status(400).json({ message: 'You already have a clearance for this semester. Delete it to create a new one.' });

    const clearance = await Clearance.create({ student_id, semester });

    const StudentSubjectStatus = require('../models/StudentSubjectStatus');
    let subjects = [];
    if (Array.isArray(subject_ids) && subject_ids.length) {
      subjects = await Subject.findAll({ where: { subject_id: subject_ids } });
      for (const subj of subjects) {
        await StudentSubjectStatus.create({ student_id, subject_id: subj.subject_id, status: 'Pending', semester });
      }
    }

    // Include department with staff signature for selected subjects
    const subjectsWithDept = await Subject.findAll({
      where: { subject_id: subject_ids || [] },
      include: [
        { model: Department, as: 'department', attributes: ['department_id','name','requirements','status'], include: [{ model: Staff, as: 'staff', attributes: ['staff_id','firstname','lastname','email','signature'] }] },
        { model: Teacher, as: 'teacher', attributes: ['teacher_id','firstname','lastname','email','signature'] }
      ]
    });

    const departmentMap = {};
    subjectsWithDept.forEach(s => {
      if (s.department) {
        const d = s.department;
        if (!departmentMap[d.department_id]) {
          departmentMap[d.department_id] = {
            department_id: d.department_id,
            name: d.name,
            staff: d.staff ? {
              staff_id: d.staff.staff_id,
              firstname: d.staff.firstname,
              lastname: d.staff.lastname,
              email: d.staff.email,
              signature: d.staff.signature,
            } : null
          };
        }
      }
    });
    const departments = Object.values(departmentMap);

    res.status(201).json({
      message: 'Clearance created',
      clearance,
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects: subjectsWithDept,
      departments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.precheckClearance = async (req, res) => {
  try {
    const { student_id, semester } = req.query;
    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    // Get subjects for the student's course (all year levels, not just their current year level)
    const where = { course: student.course };
    if (semester) where.semester = semester;
    const subjects = await Subject.findAll({
      where,
      include: [
        { model: Teacher, as: 'teacher', attributes: ['teacher_id','firstname','lastname','email','signature'] },
        { model: Department, as: 'department', attributes: ['department_id','name'], include: [{ model: Staff, as: 'staff', attributes: ['staff_id','firstname','lastname','email','signature'] }] }
      ],
      order: [['year_level', 'ASC'], ['name', 'ASC']] // Sort by year level then name
    });
    const departmentMap = {};
    subjects.forEach(s => {
      if (s.department && !departmentMap[s.department.department_id]) {
        const d = s.department;
        departmentMap[d.department_id] = {
          department_id: d.department_id,
            name: d.name,
            staff: d.staff ? {
              staff_id: d.staff.staff_id,
              firstname: d.staff.firstname,
              lastname: d.staff.lastname,
              email: d.staff.email,
              signature: d.staff.signature,
            } : null
        };
      }
    });
    res.json({
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects,
      departments: Object.values(departmentMap)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClearanceStatus = async (req, res) => {
  try {
    const { student_id, semester } = req.query;
    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const clearanceWhere = { student_id };
    if (semester) clearanceWhere.semester = semester;
    const clearance = await Clearance.findOne({ where: clearanceWhere });
    if (!clearance) {
      return res.json({
        clearance: null,
        needToRequest: !!semester,
        message: semester ? 'No clearance for this semester. Please request one first.' : 'No clearance found.',
        student: {
          firstname: student.firstname,
          lastname: student.lastname,
          course: student.course,
          year_level: student.year_level,
          block: student.block,
        },
        subjects: [],
        departments: []
      });
    }

    const StudentSubjectStatus = require('../models/StudentSubjectStatus');
    if (!Subject.associations.StudentSubjectStatus) {
      Subject.hasMany(StudentSubjectStatus, { as: 'StudentSubjectStatus', foreignKey: 'subject_id' });
    }

    let statusRows = await StudentSubjectStatus.findAll({
      where: { student_id: student.student_id, [Op.or]: [{ semester: clearance.semester }, { semester: null }] },
      attributes: ['id','subject_id','status','semester']
    });

    const legacyNull = statusRows.filter(r => !r.semester);
    if (legacyNull.length) {
      const fixIds = [...new Set(legacyNull.map(r => r.subject_id))];
      const fixSubjects = await Subject.findAll({ where: { subject_id: fixIds } });
      const semMap = new Map(fixSubjects.map(s => [s.subject_id, s.semester]));
      for (const row of legacyNull) { row.semester = semMap.get(row.subject_id) || clearance.semester; try { await row.save(); } catch {} }
      statusRows = await StudentSubjectStatus.findAll({ where: { student_id: student.student_id, semester: clearance.semester }, attributes: ['id','subject_id','status','semester'] });
    }

    const selectedIds = statusRows.map(s => s.subject_id);
    const subjects = await Subject.findAll({
      where: { subject_id: selectedIds },
      include: [
        { model: Teacher, as: 'teacher', attributes: ['teacher_id','firstname','lastname','email','signature'] },
        { model: StudentSubjectStatus, as: 'StudentSubjectStatus', required: false, where: { student_id: student.student_id }, attributes: ['status'] },
        { model: Department, as: 'department', attributes: ['department_id','name'], include: [{ model: Staff, as: 'staff', attributes: ['staff_id','firstname','lastname','email','signature'] }] }
      ]
    });

    const subjectsWithStatus = flattenSubjectStatuses(subjects);

    // Build departments array (unique) with staff + signature
    const departmentMap = {};
    subjectsWithStatus.forEach(s => {
      if (s.department && !departmentMap[s.department.department_id]) {
        const d = s.department;
        departmentMap[d.department_id] = {
          department_id: d.department_id,
          name: d.name,
          staff: d.staff ? {
            staff_id: d.staff.staff_id,
            firstname: d.staff.firstname,
            lastname: d.staff.lastname,
            email: d.staff.email,
            signature: d.staff.signature,
          } : null
        };
      }
    });
    const departments = Object.values(departmentMap);

    const allApproved = subjectsWithStatus.length > 0 && subjectsWithStatus.every(s => s.StudentSubjectStatus?.status === 'Approved');
    if (allApproved && clearance.status !== 'Approved') { clearance.status = 'Approved'; await clearance.save(); }

    res.json({
      clearance,
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects: subjectsWithStatus,
      departments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteClearance = async (req, res) => {
  try {
    const { student_id, password, semester } = req.body;
    const clearance = await Clearance.findOne({ where: { student_id, semester } });
    if (!clearance) return res.status(404).json({ message: 'No clearance found to delete.' });
    const student = await User.findByPk(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password.' });
    await clearance.destroy();
    res.json({ message: 'Clearance deleted.' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.adminDeleteClearance = async (req, res) => {
  try {
    const { student_id } = req.body;
    const clearance = await Clearance.findOne({ where: { student_id } });
    if (!clearance) return res.status(404).json({ message: 'No clearance found to delete.' });
    await clearance.destroy();
    res.json({ message: 'Clearance deleted by admin.' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.getAllClearanceRequests = async (req, res) => {
  try {
    const clearances = await Clearance.findAll({ include: [{ model: User, as: 'student', attributes: ['student_id','firstname','lastname','course','year_level','block','email'] }] });
    res.json(clearances);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.updateClearanceStatus = async (req, res) => {
  try {
    const { clearance_id } = req.params; const { status } = req.body;
    const clearance = await Clearance.findByPk(clearance_id);
    if (!clearance) return res.status(404).json({ message: 'Clearance not found.' });
    clearance.status = status; await clearance.save();
    await User.update({ clearance_status: status.toLowerCase() }, { where: { student_id: clearance.student_id } });
    res.json({ message: `Clearance ${status.toLowerCase()}.`, clearance });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.getClearanceStatusAnalytics = async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const results = await Clearance.findAll({ attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']], group: ['status'] });
    const analytics = {}; results.forEach(r => analytics[r.status] = parseInt(r.get('count'),10));
    res.json(analytics);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

exports.requestDepartmentApproval = async (req, res) => {
  try { res.json({ message: 'Department approval request submitted.' }); }
  catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};