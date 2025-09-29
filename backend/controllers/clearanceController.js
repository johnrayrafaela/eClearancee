// In controllers/clearanceController.js
const User = require('../models/User');
const Subject = require('../models/Subject');
const Clearance = require('../models/Clearance');
const Teacher = require('../models/Teacher');
const bcrypt = require('bcrypt'); // Make sure to install bcrypt if not yet
const { Op } = require('sequelize');

exports.getStudentClearanceInfo = async (req, res) => {
  try {
    // Assume student_id is available from auth/session
    const student_id = req.user.student_id; // or froam req.params or req.query
    const student = await User.findByPk(student_id);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Get subjects for student's course and year_level
    const subjects = await Subject.findAll({
      where: {
        course: student.course,
        year_level: student.year_level,
      }
    });

    // Optionally, include teachers if you have a relation
    // const subjectsWithTeachers = await Subject.findAll({
    //   where: { course: student.course, year_level: student.year_level },
    //   include: [{ model: Teacher }]
    // });

    res.json({
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects, // or subjectsWithTeachers
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

    // Check if clearance already exists for this semester
    const existing = await Clearance.findOne({ where: { student_id, semester } });
    if (existing) {
      return res.status(400).json({ message: 'You already have a clearance for this semester. Delete it to create a new one.' });
    }

    // Save semester in clearance (add semester column to Clearance model if needed)
    const clearance = await Clearance.create({ student_id, semester });

    // Only associate selected subjects
    let subjects = [];
    if (Array.isArray(subject_ids) && subject_ids.length > 0) {
      subjects = await Subject.findAll({
        where: { subject_id: subject_ids }
      });
      // Optionally, create StudentSubjectStatus records for each subject
      const StudentSubjectStatus = require('../models/StudentSubjectStatus');
      for (const subj of subjects) {
        await StudentSubjectStatus.create({
          student_id,
          subject_id: subj.subject_id,
          status: 'Pending',
          semester, // store semester so later filtering is accurate
        });
      }
    }

    // Fetch department info for selected subjects
    const subjectsWithDept = await Subject.findAll({
      where: { subject_id: subject_ids },
      include: [
        {
          model: require('../models/Department'),
          as: 'department',
          include: [
            {
              model: require('../models/Staff'),
              as: 'staff',
              attributes: ['staff_id', 'firstname', 'lastname', 'email']
            }
          ],
          attributes: ['department_id', 'name']
        }
      ]
    });

    // Get all unique departments with staff info
    const departmentMap = {};
    subjectsWithDept.forEach(s => {
      if (s.department) {
        const deptId = s.department.department_id;
        if (!departmentMap[deptId]) {
          departmentMap[deptId] = {
            department_id: deptId,
            name: s.department.name,
            staff: s.department.staff ? {
              staff_id: s.department.staff.staff_id,
              firstname: s.department.staff.firstname,
              lastname: s.department.staff.lastname,
              email: s.department.staff.email
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

    // Filter subjects by semester
    const where = {
      course: student.course,
      year_level: student.year_level,
    };
    if (semester) where.semester = semester;

    const subjects = await Subject.findAll({
      where,
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['teacher_id', 'firstname', 'lastname', 'email']
        },
        {
          model: require('../models/Department'),
          as: 'department',
          include: [
            {
              model: require('../models/Staff'),
              as: 'staff',
              attributes: ['staff_id', 'firstname', 'lastname', 'email']
            }
          ],
          attributes: ['department_id', 'name']
        }
      ]
    });

    // Get all unique departments with staff info
    const departmentMap = {};
    subjects.forEach(s => {
      if (s.department) {
        const deptId = s.department.department_id;
        if (!departmentMap[deptId]) {
          departmentMap[deptId] = {
            department_id: deptId,
            name: s.department.name,
            staff: s.department.staff ? {
              staff_id: s.department.staff.staff_id,
              firstname: s.department.staff.firstname,
              lastname: s.department.staff.lastname,
              email: s.department.staff.email
            } : null
          };
        }
      }
    });
    const departments = Object.values(departmentMap);

    res.json({
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        course: student.course,
        year_level: student.year_level,
        block: student.block,
      },
      subjects,
      departments,
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
    const whereClearance = { student_id };
    if (semester) whereClearance.semester = semester;
    const clearance = await Clearance.findOne({ where: whereClearance });
    if (!clearance) {
      return res.json({
        clearance: null,
        needToRequest: !!semester, // if user explicitly asked for a semester clearance
        message: semester ? 'No clearance for this semester. Please request one first.' : 'No clearance found.',
        student: {
          firstname: student.firstname,
          lastname: student.lastname,
          course: student.course,
          year_level: student.year_level,
          block: student.block,
        },
        subjects: []
      });
    }


    // Only show subjects the student selected for this clearance
    const StudentSubjectStatus = require('../models/StudentSubjectStatus');
    // Ensure association exists for include to work
    if (!Subject.associations.StudentSubjectStatus) {
      Subject.hasMany(StudentSubjectStatus, { as: 'StudentSubjectStatus', foreignKey: 'subject_id' });
    }
    // Find all StudentSubjectStatus for this student and semester
    let studentSubjectStatuses = await StudentSubjectStatus.findAll({
      where: { student_id: student.student_id, [Op.or]: [ { semester: clearance.semester }, { semester: null } ] },
      attributes: ['id','subject_id','status','semester']
    });
    // Normalize legacy rows without semester so they don't leak across semester views
    const legacyNull = studentSubjectStatuses.filter(r => !r.semester);
    if (legacyNull.length) {
      const fixIds = [...new Set(legacyNull.map(r => r.subject_id))];
      const fixSubjects = await Subject.findAll({ where: { subject_id: fixIds } });
      const map = new Map(fixSubjects.map(s => [s.subject_id, s.semester]));
      for (const row of legacyNull) {
        row.semester = map.get(row.subject_id) || clearance.semester;
        try { await row.save(); } catch {/* ignore */}
      }
      // Refetch strictly for this clearance semester after normalization
      studentSubjectStatuses = await StudentSubjectStatus.findAll({
        where: { student_id: student.student_id, semester: clearance.semester },
        attributes: ['id','subject_id','status','semester']
      });
    }
    const selectedSubjectIds = studentSubjectStatuses.map(s => s.subject_id);
    // Fetch only the selected subjects
    const subjects = await Subject.findAll({
      where: { subject_id: selectedSubjectIds },
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['teacher_id', 'firstname', 'lastname', 'email']
        },
        {
          model: StudentSubjectStatus,
          as: 'StudentSubjectStatus',
          required: false,
          where: { student_id: student.student_id },
          attributes: ['status']
        }
      ]
    });

    // Map to ensure only one status per subject (for frontend)
    const subjectsWithStatus = subjects.map(sub => {
      let statusObj = null;
      if (Array.isArray(sub.StudentSubjectStatus) && sub.StudentSubjectStatus.length > 0) {
        statusObj = sub.StudentSubjectStatus[0];
      }
      const plain = sub.toJSON();
      plain.StudentSubjectStatus = statusObj;
      return plain;
    });

    // If all subjects are approved, auto-approve clearance if not already
    const allApproved = subjects.length > 0 && subjects.every(sub => {
      if (Array.isArray(sub.StudentSubjectStatus)) {
        // hasMany association returns array
        return sub.StudentSubjectStatus.some(sss => sss.status === 'Approved');
      } else if (sub.StudentSubjectStatus) {
        // belongsTo or hasOne
        return sub.StudentSubjectStatus.status === 'Approved';
      }
      return false;
    });
    if (allApproved && clearance.status !== 'Approved') {
      clearance.status = 'Approved';
      await clearance.save();
      // Trigger notification (example: log, or integrate with notification system)
      console.log(`Notification: Clearance for student ${student.firstname} ${student.lastname} (ID: ${student.student_id}) has been auto-approved.`);
      // If you have a notification system, call it here, e.g.:
      // await Notification.create({ user_id: student.student_id, message: 'Your clearance has been approved!' });
    }
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

    // Check password
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password.' });

    await clearance.destroy();
    res.json({ message: 'Clearance deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.adminDeleteClearance = async (req, res) => {
  try {
    const { student_id } = req.body;
    const clearance = await Clearance.findOne({ where: { student_id } });
    if (!clearance) return res.status(404).json({ message: 'No clearance found to delete.' });

    await clearance.destroy();
    res.json({ message: 'Clearance deleted by admin.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllClearanceRequests = async (req, res) => {
  try {
    // Join with User to get student info
    const clearances = await Clearance.findAll({
      include: [{
        model: require('../models/User'),
        as: 'student',
        attributes: ['student_id', 'firstname', 'lastname', 'course', 'year_level', 'block', 'email']
      }]
    });
    res.json(clearances);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateClearanceStatus = async (req, res) => {
  try {
    const { clearance_id } = req.params;
    const { status } = req.body; // status: 'Approved' or 'Rejected'
    const clearance = await Clearance.findByPk(clearance_id);
    if (!clearance) return res.status(404).json({ message: 'Clearance not found.' });
    clearance.status = status;
    await clearance.save();

    // After updating the clearance status to 'Approved'
    await User.update(
      { clearance_status: 'approved' },
      { where: { student_id: clearance.student_id } }
    );

    res.json({ message: `Clearance ${status.toLowerCase()}.`, clearance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getClearanceStatusAnalytics = async (req, res) => {
  try {
    // Count clearances grouped by status
    const { Sequelize } = require('sequelize');
    const results = await Clearance.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Format as { status: count }
    const analytics = {};
    results.forEach(row => {
      analytics[row.status] = parseInt(row.get('count'), 10);
    });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.requestDepartmentApproval = async (req, res) => {
  try {
    const { student_id, department_id, semester } = req.body;
    // TODO: Implement logic to create a department approval request (e.g., create a DepartmentClearanceRequest model)
    // For now, just return success for demo:
    res.json({ message: 'Department approval request submitted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};