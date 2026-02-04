const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide route name'],
    },
    startingPoint: {
      type: String,
      required: true,
    },
    routeDetails: {
      type: String, // Can be textarea from frontend
    },
    waypoints: [
      {
        name: String,
        latitude: Number,
        longitude: Number,
        order: Number,
      },
    ],
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

routeSchema.index({ startingPoint: 1 });
routeSchema.index({ coordinator: 1 });

module.exports = mongoose.model('Route', routeSchema);
