const express = require('express');
const router = express.Router();

// Import Controllers
const projectController = require('../controllers/projectController.js'); 
const taskController = require('../controllers/taskController');
const bugNoteController = require('../controllers/bugNoteController');
const chatController = require('../controllers/chatController');

// ==== KONFIGURASI MULTER UNTUK UPLOAD FILE CHAT ====
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Bikin folder uploads otomatis kalau belum ada di server
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Aturan penyimpanan file (lokasi dan penamaan)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Bikin nama file unik pakai timestamp biar gak ketiban kalau namanya sama
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
// ====================================================

// Project Endpoints
router.get('/user/:userId', projectController.getUserProjects);
router.post('/', projectController.createProject);
router.get('/stats/summary', projectController.getProjectStats);
router.get('/:id', projectController.getProjectDetails);
router.post('/join/:token', projectController.joinProject);

// MAIN MISSION: Rute Hapus Resmi
router.delete('/:id', projectController.deleteProject);
router.patch('/:id/status', projectController.updateProjectStatus);

// Nested Tasks and Bugs within Project
router.get('/:projectId/tasks', taskController.getProjectTasks);
router.post('/:projectId/tasks', taskController.createTask);
router.get('/:projectId/members', taskController.getProjectMembers);

router.get('/:projectId/bug-notes', bugNoteController.getProjectNotes);
router.post('/:projectId/bug-notes', bugNoteController.createNote);

// ==== RUTE CHAT & FILE ====
router.get('/:projectId/chats', chatController.getProjectChats);
// Rute POST ini sekarang dikawal sama multer buat nangkep file g!
router.post('/:projectId/chats', upload.single('file'), chatController.createChat);

module.exports = router;