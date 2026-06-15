const express = require('express');
const router = express.Router();
// Ganti baris import di paling atas file backend/routes/projectRoutes.js kamu g:
const projectController = require('../controllers/projectController.js'); const taskController = require('../controllers/taskController');
const bugNoteController = require('../controllers/bugNoteController');
const chatController = require('../controllers/chatController');

// Project Endpoints
router.get('/user/:userId', projectController.getUserProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectDetails);
router.post('/join/:token', projectController.joinProject);

// MAIN MISSION: Rute Hapus Resmi
router.delete('/:id', projectController.deleteProject);

// Nested Tasks and Bugs within Project
router.get('/:projectId/tasks', taskController.getProjectTasks);
router.post('/:projectId/tasks', taskController.createTask);
router.get('/:projectId/members', taskController.getProjectMembers);

router.get('/:projectId/bug-notes', bugNoteController.getProjectNotes);
router.post('/:projectId/bug-notes', bugNoteController.createNote);

router.get('/:projectId/chats', chatController.getProjectChats);
router.post('/:projectId/chats', chatController.createChat);

module.exports = router;