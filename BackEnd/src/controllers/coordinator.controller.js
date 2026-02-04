const User = require('../models/User.model');
const Bus = require('../models/Bus.model');
const Route = require('../models/Route.model');

// Get all coordinators (admin only)
exports.getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' });

    res.json({
      success: true,
      data: coordinators,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching coordinators',
      error: error.message,
    });
  }
};

// Create coordinator (admin only)
exports.createCoordinator = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const existingCoordinator = await User.findOne({ phone });
    if (existingCoordinator) {
      return res.status(400).json({
        success: false,
        message: 'Coordinator already exists',
      });
    }

    const coordinator = new User({
      name,
      phone,
      email,
      role: 'coordinator',
      isVerified: true,
    });

    await coordinator.save();

    res.status(201).json({
      success: true,
      message: 'Coordinator created successfully',
      data: coordinator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating coordinator',
      error: error.message,
    });
  }
};

// Update coordinator
exports.updateCoordinator = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const coordinator = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Coordinator updated successfully',
      data: coordinator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating coordinator',
      error: error.message,
    });
  }
};

// Delete coordinator
exports.deleteCoordinator = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Coordinator deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting coordinator',
      error: error.message,
    });
  }
};

// Get coordinator's buses
exports.getCoordinatorBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ coordinator: req.userId })
      .populate('driver', 'name phone')
      .populate('route', 'name startingPoint');

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

// Get coordinator's routes
exports.getCoordinatorRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ coordinator: req.userId });

    res.json({
      success: true,
      data: routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message,
    });
  }
};
