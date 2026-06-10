const db = require('../db');

const Project = {
  getUserProjects: async (userId) => {
    const [rows] = await db.query(`
      SELECT p.* 
      FROM projects p
      JOIN project_users pu ON p.id = pu.project_id
      WHERE pu.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    return rows;
  },
  create: async (name, description, userId) => {
    const invite_token = Math.random().toString(36).substring(2, 15);
    const [result] = await db.query(
      'INSERT INTO projects (name, description, invite_token) VALUES (?, ?, ?)',
      [name, description, invite_token]
    );
    const projectId = result.insertId;
    await db.query('INSERT INTO project_users (project_id, user_id) VALUES (?, ?)', [projectId, userId]);
    return { id: projectId, name, description, invite_token };
  },
  findByToken: async (token) => {
    const [rows] = await db.query('SELECT * FROM projects WHERE invite_token = ?', [token]);
    return rows[0];
  },
  addUserToProject: async (projectId, userId) => {
    await db.query('INSERT IGNORE INTO project_users (project_id, user_id) VALUES (?, ?)', [projectId, userId]);
  },
  getById: async (projectId) => {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    return rows[0];
  },
  delete: async (id) => {
    try {
      await db.query('DELETE FROM project_users WHERE project_id = ?', [id]);

      const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Project;
