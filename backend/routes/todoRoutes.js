const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController.js');

router.get('/task/:taskId', todoController.getTaskTodos);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.patch('/:id/toggle', todoController.toggleTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;