const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinator.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// All coordinator routes require authentication
router.use(authMiddleware);

// Get coordinator's buses
router.get('/buses', roleCheck('coordinator'), coordinatorController.getCoordinatorBuses);

// Get coordinator's routes
router.get('/routes', roleCheck('coordinator'), coordinatorController.getCoordinatorRoutes);

// Admin routes to manage coordinators
router.get('/', roleCheck('admin'), coordinatorController.getAllCoordinators);
router.post('/', roleCheck('admin'), coordinatorController.createCoordinator);
router.put('/:id', roleCheck('admin'), coordinatorController.updateCoordinator);
router.delete('/:id', roleCheck('admin'), coordinatorController.deleteCoordinator);

module.exports = router;
