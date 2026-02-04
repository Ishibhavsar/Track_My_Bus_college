import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  requestOTP: (phone, purpose) =>
    api.post('/auth/request-otp', { phone, purpose }),
  signup: (name, phone, otp) =>
    api.post('/auth/signup', { name, phone, otp }),
  login: (phone, otp) =>
    api.post('/auth/login', { phone, otp }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (name) =>
    api.put('/auth/profile', { name }),
};

// Bus endpoints
export const busAPI = {
  getBusesForToday: () => api.get('/bus/today'),
  getAllBuses: () => api.get('/bus'),
  createBus: (busData) => api.post('/bus', busData),
  updateBus: (id, busData) => api.put(`/bus/${id}`, busData),
  deleteBus: (id) => api.delete(`/bus/${id}`),
  updateLocation: (latitude, longitude) =>
    api.post('/bus/location', { latitude, longitude }),
};

// Driver endpoints
export const driverAPI = {
  getAllDrivers: () => api.get('/driver'),
  createDriver: (driverData) => api.post('/driver', driverData),
  updateDriver: (id, driverData) => api.put(`/driver/${id}`, driverData),
  deleteDriver: (id) => api.delete(`/driver/${id}`),
  getAssignedBus: () => api.get('/driver/assigned-bus'),
};

// Route endpoints
export const routeAPI = {
  getAllRoutes: () => api.get('/route'),
  getRoute: (id) => api.get(`/route/${id}`),
  createRoute: (routeData) => api.post('/route', routeData),
  updateRoute: (id, routeData) => api.put(`/route/${id}`, routeData),
  deleteRoute: (id) => api.delete(`/route/${id}`),
};

// Student endpoints
export const studentAPI = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (profileData) => api.put('/student/profile', profileData),
  getAllStudents: () => api.get('/student'),
};

// Coordinator endpoints
export const coordinatorAPI = {
  getBuses: () => api.get('/coordinator/buses'),
  getRoutes: () => api.get('/coordinator/routes'),
  getAllCoordinators: () => api.get('/coordinator'),
  createCoordinator: (data) => api.post('/coordinator', data),
  updateCoordinator: (id, data) => api.put(`/coordinator/${id}`, data),
  deleteCoordinator: (id) => api.delete(`/coordinator/${id}`),
};

// Admin endpoints
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllUsers: () => api.get('/admin/users'),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  sendBroadcast: (data) => api.post('/admin/broadcast', data),
};

// Broadcast endpoints
export const broadcastAPI = {
  create: (data) => api.post('/broadcasts', data),
  getAll: () => api.get('/broadcasts'),
};

export default api;
