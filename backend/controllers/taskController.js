const Task = require('../models/taskModel');

const taskController = {
  getProjectTasks: async (req, res) => {
    try {
      const tasks = await Task.getByProjectId(req.params.projectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createTask: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { title, description, status = 'on_progress' } = req.body;
      const newTask = await Task.create(projectId, title, description, status);
      res.json(newTask);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateTaskStatus: async (req, res) => {
    try {
      const { status } = req.body;
      await Task.updateStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

};

module.exports = taskController;
