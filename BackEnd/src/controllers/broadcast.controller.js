// src/controllers/broadcast.controller.js
const Broadcast = require('../models/Broadcast.model');
const User = require('../models/User.model');
const { sendOTPViaEmail } = require('../utils/otp.utils'); // reuse mailer

exports.createBroadcast = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'all', channels } = req.body;

    const broadcast = await Broadcast.create({
      title,
      message,
      targetRole,
      channels,
      sentBy: req.userId,
    });

    // basic email channel (optional)
    if (channels?.email) {
      const query =
        targetRole === 'all' ? {} : { role: targetRole, email: { $ne: null } };
      const users = await User.find(query).select('email');
      for (const u of users) {
        if (u.email) {
          await sendOTPViaEmail(u.email, message); // reuse email utility
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Broadcast created and queued',
      data: broadcast,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBroadcasts = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const broadcasts = await Broadcast.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('sentBy', 'name role');

    res.json({ success: true, data: broadcasts });
  } catch (err) {
    next(err);
  }
};
