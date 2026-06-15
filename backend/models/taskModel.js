const db = require('../db');

const Task = {
  getByProjectId: async (projectId) => {
    const [tasks] = await db.query('SELECT * FROM tasks WHERE project_id = ?', [projectId]);
    for (let task of tasks) {
      const [assignees] = await db.query(
        'SELECT u.id, u.username, u.email FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = ?',
        [task.id]
      );
      task.assignees = assignees;
    }
    return tasks;
  },

  create: async (projectId, title, description, status, priority, deadline) => {
    const [result] = await db.query(
      'INSERT INTO tasks (project_id, title, description, status, priority, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [projectId, title, description, status, priority || 'medium', deadline || null]
    );
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  },

  updateDetails: async (taskId, title, description, priority, deadline) => {
    await db.query(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, deadline = ? WHERE id = ?',
      [title, description, priority, deadline || null, taskId]
    );
  },

  addUserToTask: async (taskId, userId) => {
    await db.query('INSERT IGNORE INTO task_users (task_id, user_id) VALUES (?, ?)', [taskId, userId]);
  },

  removeAllAssignees: async (taskId) => {
    await db.query('DELETE FROM task_users WHERE task_id = ?', [taskId]);
  },

  getProjectMembers: async (projectId) => {
    const [rows] = await db.query(
      'SELECT u.id, u.username, u.email FROM users u JOIN project_users pu ON u.id = pu.user_id WHERE pu.project_id = ?',
      [projectId]
    );
    return rows;
  }
};

module.exports = Task;