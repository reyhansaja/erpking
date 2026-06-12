const BugNote = require('../models/bugNoteModel');

const bugNoteController = {
  getProjectNotes: async (req, res) => {
    try {
      const notes = await BugNote.getByProjectId(req.params.projectId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createNote: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { title, type, content } = req.body;
      const newNote = await BugNote.create(projectId, title, type, content);
      res.json(newNote);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  toggleNoteStatus: async (req, res) => {
    try {
      await BugNote.toggleStatus(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bugNoteController;
