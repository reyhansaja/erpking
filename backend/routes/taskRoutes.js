const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

<<<<<<< HEAD
router.put('/:id', taskController.updateTaskUniversal);
router.delete('/:id', taskController.deleteTask);
=======
// Task Routes (Nested under /api/tasks)
router.get('/all-deadlines', taskController.getAllDeadlines);
router.get('/:projectId', taskController.getProjectTasks);
router.post('/:projectId', taskController.createTask);
router.put('/:id', taskController.updateTaskUniversal);
router.put('/:taskId/deadline', taskController.updateDeadline);
router.put('/:id/status', taskController.updateStatus);
>>>>>>> b6584cf7bec368f66a52c686437831f0caa25492

deleteTask: async (req, res) => {
    try {
        const { id } = req.params;
        await require('../db').query('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
},
    module.exports = router;