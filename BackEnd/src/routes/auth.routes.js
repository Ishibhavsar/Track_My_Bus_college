const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireFields } = require('../utils/validation');

router.post('/request-otp', authController.requestOTP);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
// router.post('/request-otp',requireFields(['purpose'], 'body'),authController.requestOTP);

module.exports = router;
