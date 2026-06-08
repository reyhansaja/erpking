const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

router.get('/:userId', todoController.getUserTodos);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.patch('/:id/toggle', todoController.toggleTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
