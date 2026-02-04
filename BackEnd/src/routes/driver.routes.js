// src/routes/driver.routes.js
const express = require('express');
const router = express.Router();

const driverController = require('../controllers/driver.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Admin / coordinator: list & manage drivers
router.get('/', roleCheck('admin', 'coordinator'), driverController.getAllDrivers);
router.post('/', roleCheck('admin', 'coordinator'), driverController.createDriver);
router.put('/:id', roleCheck('admin', 'coordinator'), driverController.updateDriver);
router.delete('/:id', roleCheck('admin', 'coordinator'), driverController.deleteDriver);

// Driver: get own assigned bus
router.get('/assigned-bus', roleCheck('driver'), driverController.getAssignedBus);

module.exports = router;
