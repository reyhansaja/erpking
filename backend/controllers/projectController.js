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
  }
};