const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please provide bus number'],
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    departureTime: {
      type: String, // HH:MM format
      required: true,
    },
    capacity: {
      type: Number,
      default: 50,
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    },
    isAvailableToday: {
      type: Boolean,
      default: true,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// busSchema.index({ busNumber: 1 });
// busSchema.index({ driver: 1 });
// busSchema.index({ route: 1 });

module.exports = mongoose.model('Bus', busSchema);
