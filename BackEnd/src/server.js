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
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ===== Daily tracking reset at 10:00 AM server time =====
const scheduleDailyReset = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(10, 0, 0, 0); // 10:00:00.000
  if (next <= now) {
    // if 10am already passed today, schedule for tomorrow
    next.setDate(next.getDate() + 1);
  }

  const msUntilNext = next.getTime() - now.getTime();
  console.log(`Scheduling daily tracking reset in ${Math.round(msUntilNext / 1000 / 60)} minutes`);

  setTimeout(async () => {
    try {
      const Bus = require('./models/Bus.model');
      console.log('Running daily tracking reset: clearing currentLocation and stopArrivals for all buses');
      await Bus.updateMany({}, { $set: { currentLocation: null, stopArrivals: [] } });
      // notify connected clients
      try {
        io.emit('tracking-reset', { message: 'Daily tracking reset performed' });
      } catch (e) {
        console.warn('Failed to emit tracking-reset event', e.message || e);
      }
      console.log('Daily tracking reset completed');
    } catch (err) {
      console.error('Error during daily tracking reset:', err);
    }
    // schedule following resets every 24 hours
    setInterval(async () => {
      try {
        const Bus = require('./models/Bus.model');
        console.log('Running scheduled daily tracking reset');
        await Bus.updateMany({}, { $set: { currentLocation: null, stopArrivals: [] } });
        io.emit('tracking-reset', { message: 'Daily tracking reset performed' });
      } catch (err) {
        console.error('Error during scheduled daily tracking reset:', err);
      }
    }, 24 * 60 * 60 * 1000);
  }, msUntilNext);
};

scheduleDailyReset();
