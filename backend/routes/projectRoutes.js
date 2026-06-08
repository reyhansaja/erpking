const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const bugNoteController = require('../controllers/bugNoteController');
const chatController = require('../controllers/chatController');

// Project Endpoints
router.get('/user/:userId', projectController.getUserProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectDetails);
router.post('/join/:token', projectController.joinProject);

// Nested Tasks and Bugs within Project
router.get('/:projectId/tasks', taskController.getProjectTasks);
router.post('/:projectId/tasks', taskController.createTask);

router.get('/:projectId/bug-notes', bugNoteController.getProjectNotes);
router.post('/:projectId/bug-notes', bugNoteController.createNote);

router.get('/:projectId/chats', chatController.getProjectChats);
router.post('/:projectId/chats', chatController.createChat);

module.exports = router;
