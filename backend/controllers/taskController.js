const Task = require('../models/taskModel');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAssignEmail = async (assigneeEmail, assigneeUsername, task, projectName) => {
  const priorityLabel = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };
  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Tidak ada deadline';

  await transporter.sendMail({
    from: `"ERPKing" <${process.env.EMAIL_USER}>`,
    to: assigneeEmail,
    subject: `📋 Kamu di-assign ke task: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #4f46e5;">Halo, ${assigneeUsername}! 👋</h2>
        <p style="color: #374151;">Kamu baru saja di-assign ke sebuah task di project <strong>${projectName}</strong>.</p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <h3 style="color: #111827; margin: 0 0 12px 0;">📌 Detail Task</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b7280; width: 120px;">Judul</td><td style="padding: 6px 0; font-weight: bold; color: #111827;">${task.title}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Deskripsi</td><td style="padding: 6px 0; color: #374151;">${task.description || '-'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Prioritas</td><td style="padding: 6px 0; color: #374151;">${priorityLabel[task.priority] || 'Sedang'}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Deadline</td><td style="padding: 6px 0; color: #374151;">${deadlineText}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0; color: #374151;">${task.status}</td></tr>
          </table>
        </div>
        <p style="color: #6b7280; font-size: 13px;">Silakan login ke ERPKing untuk melihat detail selengkapnya.</p>
      </div>
    `
  });
};

const taskController = {
  getProjectTasks: async (req, res) => {
    try {
      const tasks = await Task.getByProjectId(req.params.projectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectMembers: async (req, res) => {
    try {
      const members = await Task.getProjectMembers(req.params.projectId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createTask: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { title, description, status = 'on_progress', priority = 'medium', deadline, assigneeIds = [], projectName = '' } = req.body;

      const newTask = await Task.create(projectId, title, description, status, priority, deadline);

      // Assign anggota dan kirim email
      for (const assignee of assigneeIds) {
        await Task.addUserToTask(newTask.id, assignee.id);
        try {
          await sendAssignEmail(assignee.email, assignee.username, { ...newTask, title, description, priority, deadline }, projectName);
        } catch (emailErr) {
          console.error('Gagal kirim email ke', assignee.email, emailErr.message);
        }
      }

      const [tasks] = await require('../db').query('SELECT * FROM tasks WHERE id = ?', [newTask.id]);
      const task = tasks[0];
      const [assignees] = await require('../db').query(
        'SELECT u.id, u.username, u.email FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = ?',
        [task.id]
      );
      task.assignees = assignees;

      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateTaskUniversal: async (req, res) => {
    try {
      const taskId = req.params.id;
      const { title, description, status, priority, deadline } = req.body;

      if (status !== undefined && title === undefined) {
        await Task.updateStatus(taskId, status);
        return res.json({ success: true });
      }

      if (title !== undefined || description !== undefined) {
        await Task.updateDetails(taskId, title, description, priority, deadline);
        return res.json({ success: true });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      await require('../db').query('DELETE FROM tasks WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = taskController;