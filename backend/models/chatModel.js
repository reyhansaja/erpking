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
  create: async (projectId, userId, message) => {
    const [result] = await db.query(
      'INSERT INTO chats (project_id, user_id, message) VALUES (?, ?, ?)',
      [projectId, userId, message]
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