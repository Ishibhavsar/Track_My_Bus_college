// src/models/Analytics.model.js
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['student', 'driver', 'coordinator', 'admin'],
    },
    type: {
      type: String,
      enum: [
        'login',
        'logout',
        'bus_view',
        'bus_track',
        'location_update',
        'broadcast_view',
        'route_update',
      ],
      required: true,
    },
    meta: { type: Object }, // { busId, routeId, ... }
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
