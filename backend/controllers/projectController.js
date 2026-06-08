const Project = require('../models/projectModel');

const projectController = {
  getUserProjects: async (req, res) => {
    try {
      const projects = await Project.getUserProjects(req.params.userId);
      res.json(projects);
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
  }
};

module.exports = projectController;
