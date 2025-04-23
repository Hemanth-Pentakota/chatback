const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Setting up socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for development)
    methods: ["GET", "POST"]
  },
});

// Listen for a connection from a frontend client
io.on("connection", (socket) => {
  console.log("[Backend] New user connected:", socket.id);

  // Listen for a user joining a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`[Backend] User ${socket.id} joined room: ${roomId}`);

    // Listen for messages in this room
    socket.on("send-message", (msg) => {
      console.log(`[Backend] Received message from ${socket.id} in room ${roomId}:`, msg);

      io.to(roomId).emit("receive-message", {
        sender: socket.id,
        message: msg,
      });

      console.log(`[Backend] Message emitted to room ${roomId}`);
    });

    // Handle user disconnecting
    socket.on("disconnect", () => {
      console.log("[Backend] User disconnected:", socket.id);
    });
  });
});

// Start the server on port 5000
server.listen(5000, () => {
  console.log("[Backend] Server is running on http://localhost:5000");
});