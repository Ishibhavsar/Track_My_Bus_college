const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler.middleware');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  socket.on('join-bus', (busId) => {
    socket.join(`bus:${busId}`);
  });
});

// export io for controllers
app.set('io', io);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB Connected');
  })
  .catch((err) => {
    console.error('✗ MongoDB Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/bus', require('./routes/bus.routes'));
app.use('/api/driver', require('./routes/driver.routes'));
app.use('/api/coordinator', require('./routes/coordinator.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/route', require('./routes/route.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/broadcasts', require('./routes/broadcast.routes'));
app.use(errorHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});
