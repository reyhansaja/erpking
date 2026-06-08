const Chat = require('../models/chatModel');

const chatController = {
  getProjectChats: async (req, res) => {
    try {
      const chats = await Chat.getByProjectId(req.params.projectId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createChat: async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { userId, message } = req.body;
      const newChat = await Chat.create(projectId, userId, message);
      
      const io = req.app.get('io');
      if (io) {
        io.to(`project_${projectId}`).emit('new_chat', newChat);
      }
      
      res.json(newChat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = chatController;
