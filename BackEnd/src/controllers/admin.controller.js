const User = require('../models/User.model');
const Bus = require('../models/Bus.model');
const Route = require('../models/Route.model');

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const driverCount = await User.countDocuments({ role: 'driver' });
    const coordinatorCount = await User.countDocuments({
      role: 'coordinator',
    });
    const busCount = await Bus.countDocuments({ status: 'active' });
    const routeCount = await Route.countDocuments();

    res.json({
      success: true,
      data: {
        students: studentCount,
        drivers: driverCount,
        coordinators: coordinatorCount,
        buses: busCount,
        routes: routeCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};

    const users = await User.find(query);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// Create student (admin)
exports.createStudent = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const existingStudent = await User.findOne({ phone });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists',
      });
    }

    const student = new User({
      name,
      phone,
      email,
      role: 'student',
      isVerified: true,
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message,
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    const student = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message,
    });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message,
    });
  }
};

// Send broadcast notification
exports.sendBroadcast = async (req, res) => {
  try {
    const { message, sendViaEmail, sendViaApp, targetRole } = req.body;

    // Get target users
    const query = targetRole ? { role: targetRole } : {};
    const users = await User.find(query);

    // TODO: Integrate with email/SMS/push notification service
    // For now, just log
    console.log(`Broadcast to ${users.length} users: ${message}`);

    res.json({
      success: true,
      message: `Broadcast sent to ${users.length} users`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending broadcast',
      error: error.message,
    });
  }
};
