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

// ==== SOLUSI ANTI CORS ERROR g ====
// (Membuka gerbang untuk semua link frontend tanpa kecuali)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Backend ERPKu Aktif g!');
});

const server = http.createServer(app);

// ==== SOCKET IO JUGA DIBIKIN KEBAL CORS ====
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io);

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bug-notes', bugNoteRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/todos', todoRoutes);

app.use((err, req, res, next) => {
  console.error('Runtime Error:', err.stack);
  res.status(500).send('Something broke inside backend!');
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=== SERVER JUJUR NYALA DI PORT ${PORT} ===`);
});