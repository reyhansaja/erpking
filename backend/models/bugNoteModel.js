const db = require('../db');

const BugNote = {
  getByProjectId: async (projectId) => {
    const [rows] = await db.query('SELECT * FROM bug_notes WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
    return rows;
  },
  create: async (projectId, type, content) => {
    const [result] = await db.query(
      'INSERT INTO bug_notes (project_id, type, content) VALUES (?, ?, ?)',
      [projectId, type, content]
    );
    return { id: result.insertId, projectId, type, content, is_crossed_out: 0 };
  },
  toggleStatus: async (id) => {
    await db.query('UPDATE bug_notes SET is_crossed_out = NOT is_crossed_out WHERE id = ?', [id]);
  }
};

module.exports = BugNote;
