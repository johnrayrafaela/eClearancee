const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.post('/', departmentController.createDepartment);
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartment);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);
router.get('/staff/:staff_id', departmentController.getDepartmentsByStaff);
router.patch('/:id/requirements', departmentController.updateDepartmentRequirements);

module.exports = router;
