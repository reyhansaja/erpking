const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Task Routes (Nested under /api/tasks)
router.put('/:id', taskController.updateTaskStatus);

module.exports = router;
