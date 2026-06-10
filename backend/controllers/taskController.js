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

  // ==== FUNGSI BARU: UPDATE UNIVERSAL (Bisa nerima status ATAU catatan) g! ====
  updateTaskUniversal: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { title, description, status } = req.body;

      // Skenario 1: Kalau frontend cuma ngirim status (saat kamu mindahin kartu Kanban)
      if (status !== undefined && title === undefined) {
        await Task.updateStatus(taskId, status);
        return res.json({ success: true, message: 'Status sukses diupdate g!' });
      }

      // Skenario 2: Kalau frontend ngirim judul & catatan (saat kamu klik Simpan di pop-up)
      if (title !== undefined || description !== undefined) {
        // Kita panggil fungsi baru di Model untuk nyimpan teks
        await Task.updateDetails(taskId, title, description);
        return res.json({ success: true, message: 'Catatan sukses disimpan g!' });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = taskController;