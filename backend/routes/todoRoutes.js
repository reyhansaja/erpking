const express = require('express');
const router = express.Router();
// Ganti baris import di paling atas file backend/routes/todoRoutes.js kamu g:
const todoController = require('../controllers/todoController.js');
router.get('/:userId', todoController.getUserTodos);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.patch('/:id/toggle', todoController.toggleTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
