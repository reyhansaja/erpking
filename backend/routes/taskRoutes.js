const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Task Routes (Nested under /api/tasks)
router.get('/all-deadlines', taskController.getAllDeadlines);
router.get('/:projectId', taskController.getProjectTasks);
router.post('/:projectId', taskController.createTask);
router.put('/:id', taskController.updateTaskUniversal);
router.put('/:taskId/deadline', taskController.updateDeadline);
router.put('/:id/status', taskController.updateStatus);

module.exports = router;
