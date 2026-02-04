const express = require('express');
const router = express.Router();
const busController = require('../controllers/bus.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// Public routes
router.get('/today', busController.getBusesForToday);

// Protected routes (admin and coordinator have full CRUD access)
router.post('/', authMiddleware, roleCheck('coordinator', 'admin'), busController.createBus);
router.get('/', authMiddleware, busController.getAllBuses);
router.put('/:id', authMiddleware, roleCheck('coordinator', 'admin'), busController.updateBus);
router.delete('/:id', authMiddleware, roleCheck('coordinator', 'admin'), busController.deleteBus);

// Location tracking
router.post('/location', authMiddleware, roleCheck('driver'), busController.updateBusLocation);
router.get('/:id/location', authMiddleware, busController.getBusLocation); // New 

module.exports = router;
