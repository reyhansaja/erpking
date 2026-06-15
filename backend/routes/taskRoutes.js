const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.put('/:id', taskController.updateTaskUniversal);
router.delete('/:id', taskController.deleteTask);

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