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
  updateDeadline: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { deadline } = req.body;
      await Task.updateDeadline(taskId, deadline);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getAllDeadlines: async (req, res) => {
    try {
      const tasks = await Task.getAllDeadlines();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await Task.updateStatus(id, status);

      if (status === 'Done') {
        const emailService = require('../service/emailService');
        const [tasks] = await db.query(
          `SELECT t.title, p.name as project_name, u.email
           FROM tasks t
           JOIN projects p ON t.project_id = p.id
           JOIN task_users tu ON t.id = tu.task_id
           JOIN users u ON tu.user_id = u.id
           WHERE t.id = ?`,
          [id]
        );
        if (tasks.length > 0) {
          const task = tasks[0];
          await emailService.sendTaskDoneNotification({
            toEmail: task.email,
            taskTitle: task.title,
            projectName: task.project_name,
          });
        }
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

};

module.exports = taskController;