const Chat = require('../models/chatModel');
const { google } = require('googleapis');
const fs = require('fs');

// ==== SETUP GOOGLE DRIVE API VIA ENVIRONMENT VARIABLES ====
const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : "",
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

// Helper function untuk upload ke Google Drive
async function uploadToDrive(filePath, mimeType, originalName) {
  // DEBUG 1: Cek apakah file ada secara fisik
  if (!fs.existsSync(filePath)) {
    throw new Error(`File tidak ditemukan di path: ${filePath}`);
  }

  // DEBUG 2: Cek folderId yang terdeteksi
  let folderId = process.env.DRIVE_FOLDER_FILE; 
  if (mimeType.startsWith('image/')) folderId = process.env.DRIVE_FOLDER_FOTO;
  else if (mimeType.startsWith('video/')) folderId = process.env.DRIVE_FOLDER_VIDEO;
  
  console.log("DEBUG_DRIVE: Target Folder ID =", folderId);

  try {
    const res = await drive.files.create({
      resource: { 
          name: originalName, 
          parents: folderId ? [folderId] : [] 
      },
      media: { 
          mimeType: mimeType, 
          body: fs.createReadStream(filePath) 
      },
      fields: 'id'
    });

    console.log("SUKSES! File terupload ke Drive dengan ID:", res.data.id);

    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    return `https://drive.google.com/uc?export=view&id=${res.data.id}`;
  } catch (apiError) {
    // DEBUG 3: Menangkap detail error dari API Google
    console.error("DEBUG_DRIVE_ERROR:", JSON.stringify(apiError.errors || apiError.message));
    throw apiError;
  }
}

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
      
      let fileUrl = null;
      let fileType = null;

      if (req.file) {
        fileType = req.file.mimetype;
        const filePath = req.file.path; 

        try {
          fileUrl = await uploadToDrive(filePath, fileType, req.file.originalname);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (uploadError) {
          // Mengirim pesan error yang lebih jelas ke frontend
          return res.status(500).json({ 
              error: "Gagal upload ke Drive. Cek Log Explorer untuk detail DEBUG_DRIVE_ERROR" 
          });
        }
      }

      const newChat = await Chat.create(projectId, userId, message || '', fileUrl, fileType);
      
      const io = req.app.get('io');
      if (io) io.to(`project_${projectId}`).emit('new_chat', newChat);
      
      res.json(newChat);
    } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = chatController;