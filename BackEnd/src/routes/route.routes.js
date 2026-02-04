const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');

// Get all routes (public)
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRoute);

// Protected routes (admin and coordinator have full CRUD access)
router.post('/', authMiddleware, roleCheck('coordinator', 'admin'), routeController.createRoute);
router.put('/:id', authMiddleware, roleCheck('coordinator', 'admin'), routeController.updateRoute);
router.delete('/:id', authMiddleware, roleCheck('coordinator', 'admin'), routeController.deleteRoute);

module.exports = router;
