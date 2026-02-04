const User = require('../models/User.model');
const Bus = require('../models/Bus.model');

// Get all students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select(
      '-passwordHash'
    );

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// Get student details
exports.getStudentDetails = async (req, res) => {
  try {
    const student = await User.findById(req.userId).select('-passwordHash');

    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student details',
      error: error.message,
    });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const student = await User.findByIdAndUpdate(
      req.userId,
      { name, email },
      { new: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};
