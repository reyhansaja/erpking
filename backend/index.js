require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const bugNoteRoutes = require('./routes/bugNoteRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173",
    "https://erpking.infistream.id"], // default vite port
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User ${socket.id} joined project_${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bug-notes', bugNoteRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/todos', todoRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
