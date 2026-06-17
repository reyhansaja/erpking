// taskRoutes.js yang benar:
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/all-deadlines', taskController.getAllDeadlines);
router.get('/:projectId', taskController.getProjectTasks);
router.post('/:projectId', taskController.createTask);
router.put('/:id/status', taskController.updateStatus);
<<<<<<< HEAD
=======
router.put('/:id', taskController.updateTaskUniversal);
>>>>>>> f39b1544883d4a18d990b07f938165628de10ba8
router.delete('/:id', taskController.deleteTask);

module.exports = router;