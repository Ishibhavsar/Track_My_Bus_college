const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// Get student's own profile
router.get('/profile', authMiddleware, roleCheck('student'), studentController.getStudentDetails);

// Update own profile
router.put('/profile', authMiddleware, roleCheck('student'), studentController.updateStudentProfile);

// Admin routes
router.get('/', authMiddleware, roleCheck('admin'), studentController.getAllStudents);

module.exports = router;
