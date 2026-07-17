import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import User from "./models/user.model.js";

const port = process.env.PORT || 5000;
const mongodbUrl = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(mongodbUrl);
  } catch (error) {
    process.exit(1); // Stop the server if DB fails
  }
};

const app = express();
const server = http.createServer(app);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.post("/emit", async (req, res) => {
  const { event, userId, data } = req.body;

  try {
    const user = await User.findById(userId);
    if (user.socketId) {
      io.to(user.socketId).emit(event, data);
    }
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false });
  }
});

io.on("connection", (socket) => {
  socket.on("identity", async (userId) => {
    socket.userId = userId;
    await User.findByIdAndUpdate(userId, {
      socketId: socket.id,
      isOnline: true,
    });
  });

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    await User.findByIdAndUpdate(userId, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });
  });

  socket.on("join-ride", (bookingId) => {
    socket.join(`ride-${bookingId}`);
  });

  socket.on(
    "driver-location-update",
    ({ bookingId, latitude, longitude, status }) => {
      io.to(`ride-${bookingId}`).emit("driver-location", {
        latitude,
        longitude,
      });
    },
  );

  socket.on("chat-message", (data) => {
    io.to(`ride-${data.bookingId}`).emit("chat-message", data);
  });

  socket.on("disconnect", async () => {
    if (!socket.userId) return;

    await User.findByIdAndUpdate(socket.userId, {
      socketId: null,
      isOnline: false,
    });
  });
});

server.listen(port, async () => {
  await connectDb();
});
