// src/models/Broadcast.model.js
const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetRole: {
      type: String,
      enum: ['student', 'driver', 'coordinator', 'admin', 'all'],
      default: 'all',
    },
    channels: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

broadcastSchema.index({ targetRole: 1, createdAt: -1 });

module.exports = mongoose.model('Broadcast', broadcastSchema);
