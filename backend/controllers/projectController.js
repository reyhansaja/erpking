const Project = require('../models/projectModel');
const db = require('../db');

module.exports = {
  getUserProjects: async (req, res) => {
    try {
      const resData = await Project.getByUserId(req.params.userId);
      res.json(resData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createProject: async (req, res) => {
    try {
      // Frontend sekarang mengirimkan folderId juga g!
      const { name, description, userId, folderId } = req.body;

      // Bikin project lewat model seperti biasa
      const newProject = await Project.create(name, description, userId);

      // JIKA project ini dibuat di dalam folder, langsung kita update database-nya
      if (folderId) {
        await db.query('UPDATE projects SET folder_id = ? WHERE id = ?', [folderId, newProject.id]);
        newProject.folder_id = folderId;
      }

      res.json(newProject);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProjectFolder: async (req, res) => {
    // Tangkap ID dari URL (req.params.id) dan folderId dari body
    const projectId = req.params.id;
    const { folderId } = req.body;
    try {
      await db.query('UPDATE projects SET folder_id = ? WHERE id = ?', [folderId, projectId]);
      res.json({ message: 'Berhasil pindah folder!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectDetails: async (req, res) => {
    try {
      const project = await Project.getById(req.params.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Taruh di bawah createProject atau di mana aja dalam module.exports
  updateProjectDetails: async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      // Eksekusi update nama dan deskripsi ke database
      await db.query('UPDATE projects SET name = ?, description = ? WHERE id = ?', [name, description, id]);
      res.json({ success: true, message: 'Berhasil update detail project!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  joinProject: async (req, res) => {
    try {
      const { userId } = req.body;
      const project = await Project.findByToken(req.params.token);
      if (!project) return res.status(404).json({ error: 'Project not found' });

      await Project.addUserToProject(project.id, userId);
      res.json({ success: true, projectId: project.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM projects WHERE id = ?';

      if (db && typeof db.query === 'function') {
        await db.query(query, [id]);
      } else if (db && typeof db.execute === 'function') {
        await db.execute(query, [id]);
      } else {
        await db(query, [id]);
      }

      return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  updateProjectStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['on_progress', 'hold', 'done'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      await db.query('UPDATE projects SET status = ? WHERE id = ?', [status, id]);
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectStats: async (req, res) => {
    try {
      const [rows] = await db.query(`
              SELECT status, COUNT(*) as count 
              FROM projects 
              GROUP BY status
          `);
      const stats = { on_progress: 0, hold: 0, done: 0 };
      rows.forEach(r => { stats[r.status] = r.count; });
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await Project.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectMembers: async (req, res) => {
    try {
      const members = await Project.getProjectMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  inviteUserToProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      await Project.addUserToProject(id, userId);

      // Kirim email notifikasi ke user yang diundang
      const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
      if (users.length > 0 && projects.length > 0) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
          from: `"ERPKu System" <${process.env.EMAIL_USER}>`,
          to: users[0].email,
          subject: `📩 Kamu diundang ke project: ${projects[0].name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px;">
              <h2 style="color:#4f46e5;">Undangan Project 📩</h2>
              <p>Halo <strong>${users[0].username}</strong>,</p>
              <p>Kamu telah diundang untuk bergabung ke project <strong>${projects[0].name}</strong> di ERPKu.</p>
              <div style="background:#eff6ff; border-left:4px solid #4f46e5; padding:12px 16px; border-radius:6px; margin:16px 0;">
                Silakan login ke ERPKu untuk mulai berkontribusi.
              </div>
              <p style="color:#888; font-size:12px;">— ERPKu System</p>
            </div>
          `
        }).catch(err => console.error('Gagal kirim email undangan:', err.message));
      }

      res.json({ success: true, message: 'User berhasil diundang' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeUserFromProject: async (req, res) => {
    try {
      const { id, userId } = req.params;
      await Project.removeUserFromProject(id, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};