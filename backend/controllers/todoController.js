const Todo = require('../models/todoModel');

const todoController = {
  getUserTodos: async (req, res) => {
    try {
      const todos = await Todo.getByUserId(req.params.userId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createTodo: async (req, res) => {
    try {
      const { userId, title, priority } = req.body;
      if (!userId || !title) {
        return res.status(400).json({ error: 'userId and title are required' });
      }
      const todo = await Todo.create(userId, title, priority);
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTodo: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, title, priority, is_done } = req.body;
      const todo = await Todo.update(id, userId, { title, priority, is_done });
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  toggleTodo: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const todo = await Todo.toggleDone(id, userId);
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteTodo: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      const result = await Todo.delete(id, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = todoController;
