const User = require('../models/User.model');
const Bus = require('../models/Bus.model');

// Get all drivers (for admin/coordinator)
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });

    res.json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: error.message,
    });
  }
};

// Create driver
exports.createDriver = async (req, res) => {
  try {
    const { name, phone, email, busId } = req.body;

    // Check if driver exists
    const existingDriver = await User.findOne({ phone });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver already exists',
      });
    }

    const driver = new User({
      name,
      phone,
      email,
      role: 'driver',
      isVerified: true,
    });

    await driver.save();

    if (busId) {
      await Bus.findByIdAndUpdate(busId, { driver: driver._id });
    }

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating driver',
      error: error.message,
    });
  }
};

// Update driver
exports.updateDriver = async (req, res) => {
  try {
    const { name, phone, email, busId } = req.body;

    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true }
    );

    if (busId) {
      await Bus.findByIdAndUpdate(req.params.id, { driver: busId });
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating driver',
      error: error.message,
    });
  }
};

// Delete driver
exports.deleteDriver = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting driver',
      error: error.message,
    });
  }
};

// Get driver's bus
exports.getAssignedBus = async (req, res) => {
  try {
    const bus = await Bus.findOne({ driver: req.userId })
      .populate('route', 'name startingPoint waypoints routeDetails')
      .populate('coordinator', 'name phone');

    res.json({
      success: true,
      data: bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus',
      error: error.message,
    });
  }
};
