const Task = require('../models/taskModel');
const db = require('../db');
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
            <tr><td style="padding: 6px 0; color: #6b7280;">Status</td><td style="padding: 6px 0; color: #374151;">${task.status || 'On Progress'}</td></tr>
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
      for (const assignee of assigneeIds) {
        await Task.addUserToTask(newTask.id, assignee.id);
        try {
          await sendAssignEmail(assignee.email, assignee.username, { ...newTask, title, description, priority, deadline }, projectName);
        } catch (emailErr) {
          console.error('Gagal kirim email ke', assignee.email, emailErr.message);
        }
      }
      const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [newTask.id]);
      const task = tasks[0];
      const [assignees] = await db.query(
        'SELECT u.id, u.username, u.email FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = ?',
        [task.id]
      );
      task.assignees = assignees;
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ===== INI YANG DIBEDAH g! (Tambah logika Oper PJ) =====
  updateTaskUniversal: async (req, res) => {
    try {
      const taskId = req.params.id;
      // Tambahin penerima assigneeIds dari frontend
      const { title, description, status, priority, deadline, saved_to_gantt, assigneeIds } = req.body;

      if (saved_to_gantt) {
        await Task.updateSavedToGantt(taskId);
        return res.json({ success: true });
      }

      if (status !== undefined && title === undefined) {
        await Task.updateStatus(taskId, status);
        return res.json({ success: true });
      }

      if (title !== undefined || description !== undefined) {
        // 1. Update teks dan detailnya dulu
        await Task.updateDetails(taskId, title, description, priority, deadline);
        
        // 2. LOGIKA OPER PJ (GANTI ASSIGNEE) g!
        // Cek kalau frontend ngirim data assigneeIds (bukan undefined)
        if (assigneeIds !== undefined) {
          // Sapu bersih PJ lama
          await Task.removeAllAssignees(taskId);
          
          // Masukin PJ baru satu-satu
          for (const assignee of assigneeIds) {
            await Task.addUserToTask(taskId, assignee.id);
            // Opsional: Kalau kamu mau email notifikasi juga dikirim pas ada orang baru ditambahkan saat edit,
            // kamu bisa panggil fungsi sendAssignEmail() di sini. Sementara ini G skip biar inbox gak spam.
          }
        }
        
        return res.json({ success: true });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await Task.updateStatus(id, status);
      if (status === 'done') { // Sengaja G kecilin 'done' biar match sama value dropdown kolom g
        try {
          const [tasks] = await db.query(
            `SELECT t.title, p.name as project_name, u.email, u.username
             FROM tasks t
             JOIN projects p ON t.project_id = p.id
             JOIN task_users tu ON t.id = tu.task_id
             JOIN users u ON tu.user_id = u.id
             WHERE t.id = ?`,
            [id]
          );
          if (tasks.length > 0) {
            const task = tasks[0];
            await transporter.sendMail({
              from: `"ERPKu System" <${process.env.EMAIL_USER}>`,
              to: task.email,
              subject: `✅ Misi selesai: "${task.title}"`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px;">
                  <h2 style="color:#1a6b3c;">Misi Diselesaikan ✅</h2>
                  <p>Misi <strong>${task.title}</strong> pada proyek <strong>${task.project_name}</strong> telah selesai.</p>
                  <div style="background:#f0fdf4; border-left:4px solid #22c55e; padding:12px 16px; border-radius:6px;">
                    Progress: <strong>100% · Done</strong>
                  </div>
                </div>
              `
            });
          }
        } catch (emailErr) {
          console.error('Gagal kirim email done:', emailErr.message);
        }
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
    } catch (error) {
      res.status(500).json({ error: error.message });
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

  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query('DELETE FROM tasks WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

};

module.exports = taskController;