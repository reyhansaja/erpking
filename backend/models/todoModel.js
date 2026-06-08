const db = require('../db');

const Todo = {
  getByUserId: async (userId) => {
    const [rows] = await db.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  create: async (userId, title, priority) => {
    const [result] = await db.query(
      'INSERT INTO todos (user_id, title, priority) VALUES (?, ?, ?)',
      [userId, title, priority || 'medium']
    );
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  update: async (id, userId, fields) => {
    const { title, priority, is_done } = fields;
    await db.query(
      'UPDATE todos SET title = ?, priority = ?, is_done = ? WHERE id = ? AND user_id = ?',
      [title, priority, is_done, id, userId]
    );
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    return rows[0];
  },

  toggleDone: async (id, userId) => {
    await db.query(
      'UPDATE todos SET is_done = NOT is_done WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    return rows[0];
  },

  delete: async (id, userId) => {
    await db.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
    return { success: true };
  }
};

module.exports = Todo;
