// src/routes/broadcast.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const broadcastController = require('../controllers/broadcast.controller');
const { requireFields } = require('../utils/validation');

router.use(authMiddleware, roleCheck('admin'));

router.post(
  '/',
  requireFields(['title', 'message'], 'body'),
  broadcastController.createBroadcast
);

router.get('/', broadcastController.getBroadcasts);

module.exports = router;
