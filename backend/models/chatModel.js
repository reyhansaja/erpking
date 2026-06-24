const db = require('../db');

const Chat = {
  getByProjectId: async (projectId) => {
    const [rows] = await db.query(`
      SELECT c.*, u.username, u.role 
      FROM chats c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.project_id = ? 
      ORDER BY c.created_at ASC
    `, [projectId]);
    return rows;
  },
  
  // Parameter file_url dan file_type kita kasih default null biar aman kalau cuma kirim teks
  create: async (projectId, userId, message, file_url = null, file_type = null) => {
    // Masukkan file_url dan file_type ke dalam query INSERT g!
    const [result] = await db.query(
      'INSERT INTO chats (project_id, user_id, message, file_url, file_type) VALUES (?, ?, ?, ?, ?)',
      [projectId, userId, message, file_url, file_type]
    );
    
    const [rows] = await db.query(`
      SELECT c.*, u.username, u.role 
      FROM chats c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = ? 
    `, [result.insertId]);
    
    return rows[0];
  }
};

module.exports = Chat;