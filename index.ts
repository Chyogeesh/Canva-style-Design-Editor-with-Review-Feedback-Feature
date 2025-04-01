import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/design-editor';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('addComment', async (comment) => {
    try {
      // In a real app, you would save to database here
      // For now, we'll just broadcast
      const newComment = { ...comment, _id: Math.random().toString(36).substr(2, 9) };
      io.emit('commentAdded', newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  });

  socket.on('resolveComment', (commentId) => {
    io.emit('commentResolved', commentId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.get('/', (req, res) => {
  res.send('Design Editor Backend');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
