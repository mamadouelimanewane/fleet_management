const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active buses
const activeBuses = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a driver connects and shares location
  socket.on('driver-location', (data) => {
    // data should contain { busId, operator, lat, lng, status }
    activeBuses[socket.id] = { ...data, socketId: socket.id, lastUpdated: Date.now() };
    
    // Broadcast all active buses to the command center
    io.emit('buses-update', Object.values(activeBuses));
  });

  // When a driver sends an alert
  socket.on('driver-alert', (data) => {
    console.log(`Alert from bus ${data.busId}: ${data.message}`);
    // Broadcast alert to command center
    io.emit('buses-alert', { ...data, socketId: socket.id, timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (activeBuses[socket.id]) {
      delete activeBuses[socket.id];
      // Update command center
      io.emit('buses-update', Object.values(activeBuses));
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
