const Bus = require('../models/Bus.model');
const User = require('../models/User.model');

// Get all buses (for coordinators/drivers)
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate('driver', 'name phone')
      .populate('route', 'name startingPoint routeDetails waypoints')
      .populate('coordinator', 'name phone');

    res.json({
      success: true,
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error.message,
    });
  }
};

// Get buses for today (for students)
exports.getBusesForToday = async (req, res) => {
  try {
    const buses = await Bus.find({ isAvailableToday: true })
      .populate('driver', 'name phone')
      .populate('route', 'name startingPoint routeDetails waypoints');

    res.json({
      success: true,
      data: buses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error.message,
    });
  }
};

// Create bus
exports.createBus = async (req, res) => {
  try {
    const { busNumber, driverId, routeId, departureTime, capacity } = req.body;

    const bus = new Bus({
      busNumber,
      driver: driverId,
      route: routeId,
      departureTime,
      capacity,
      coordinator: req.userId,
    });

    await bus.save();
    await bus.populate('driver', 'name phone');
    await bus.populate('route', 'name startingPoint');

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bus',
      error: error.message,
    });
  }
};

// Update bus
exports.updateBus = async (req, res) => {
  try {
    const { busNumber, driverId, routeId, departureTime, isAvailableToday } =
      req.body;

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        busNumber,
        driver: driverId,
        route: routeId,
        departureTime,
        isAvailableToday,
      },
      { new: true }
    )
      .populate('driver', 'name phone')
      .populate('route', 'name startingPoint');

    res.json({
      success: true,
      message: 'Bus updated successfully',
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bus',
      error: error.message,
    });
  }
};

// Delete bus
exports.deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Bus deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bus',
      error: error.message,
    });
  }
};

// Update bus location (called by driver app)
exports.updateBusLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // First, update the bus location
    const bus = await Bus.findOneAndUpdate(
      { driver: req.userId },
      {
        currentLocation: {
          latitude,
          longitude,
          timestamp: new Date(),
        },
      },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'No bus assigned to this driver',
      });
    }

    // Emit socket event for real-time updates (if socket.io is configured)
    const io = req.app.get('io');
    if (io) {
      io.to(`bus:${bus._id}`).emit('location-update', {
        busId: bus._id,
        location: bus.currentLocation,
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: bus.currentLocation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message,
    });
  }
};

// in bus.controller.js
exports.getBusLocation = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id).select('currentLocation busNumber');
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }
    res.json({ success: true, data: bus.currentLocation });
  } catch (err) {
    next(err);
  }
};
