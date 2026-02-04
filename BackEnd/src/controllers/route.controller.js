const Route = require('../models/Route.model');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('coordinator', 'name phone')
      .populate('createdBy', 'name phone');

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

// Get single route
exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('coordinator', 'name phone')
      .populate('createdBy', 'name phone');

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    }

    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message,
    });
  }
};

// Create route
exports.createRoute = async (req, res) => {
  try {
    const { name, startingPoint, routeDetails, waypoints } = req.body;

    const route = new Route({
      name,
      startingPoint,
      routeDetails,
      waypoints,
      coordinator: req.userId,
      createdBy: req.userId,
    });

    await route.save();
    await route.populate('coordinator', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating route',
      error: error.message,
    });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const { name, startingPoint, routeDetails, waypoints } = req.body;

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { name, startingPoint, routeDetails, waypoints },
      { new: true }
    )
      .populate('coordinator', 'name phone')
      .populate('createdBy', 'name phone');

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating route',
      error: error.message,
    });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message,
    });
  }
};
