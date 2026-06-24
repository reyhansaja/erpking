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
      
      // Tangkap URL dan tipe file jika ada yang diupload g!
      let fileUrl = null;
      let fileType = null;

      if (req.file) {
        // Bikin link URL lengkap menuju folder lokal 'uploads'
        fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        fileType = req.file.mimetype;
      }

      // Kirim message (bisa string kosong kalau cuma kirim foto), fileUrl, dan fileType ke model
      const newChat = await Chat.create(projectId, userId, message || '', fileUrl, fileType);
      
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