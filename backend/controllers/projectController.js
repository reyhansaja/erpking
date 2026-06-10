// Ganti baris import Project lamamu menjadi nama file aslinya g:
const Project = require('../models/projectModel');const db = require('../db'); // Mengimpor koneksi database asli erp kamu

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
      const { name, description, userId } = req.body;
      const newProject = await Project.create(name, description, userId);
      res.json(newProject);
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

  // MAIN MISSION: Fungsi eksekusi hapus database SQL secara permanen
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM projects WHERE id = ?';

      // Eksekusi query aman yang adaptif dengan driver mysql/mysql2 proyekmu
      if (db && typeof db.query === 'function') {
        await db.query(query, [id]);
      } else if (db && typeof db.execute === 'function') {
        await db.execute(query, [id]);
      } else {
        // Jika db diekspor sebagai fungsi pool langsung
        await db(query, [id]);
      }

      return res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};