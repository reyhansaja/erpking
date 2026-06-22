const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {
  getAll: async () => {
    const [rows] = await db.query('SELECT id, username, email, role FROM users');
    return rows;
  },
  getByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  getById: async (id) => {
    const [rows] = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (username, email, password) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );
    return { id: result.insertId, username, email, role: 'USER' };
  },
  updateRole: async (userId, role) => {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
  },
  getByUsername: async (username) => {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },
  createWithRole: async (username, email, password_hash, role) => {
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, password_hash, role]
    );
    return { id: result.insertId, username, email, role };
  }
};

module.exports = User;
