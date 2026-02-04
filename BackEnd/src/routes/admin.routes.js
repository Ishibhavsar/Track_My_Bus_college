const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// All routes require admin role
router.use(authMiddleware, roleCheck('admin'));

// Analytics
router.get('/analytics', adminController.getAnalytics);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Broadcast
router.post('/broadcast', adminController.sendBroadcast);

module.exports = router;
