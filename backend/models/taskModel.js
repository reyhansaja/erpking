const db = require('../db');

const Task = {
  getByProjectId: async (projectId) => {
    const [tasks] = await db.query('SELECT * FROM tasks WHERE project_id = ?', [projectId]);
    for (let task of tasks) {
      const [assignees] = await db.query(
        'SELECT u.id, u.username FROM users u JOIN task_users tu ON u.id = tu.user_id WHERE tu.task_id = ?',
        [task.id]
      );
      task.assignees = assignees;
    }
    return tasks;
  },
  create: async (projectId, title, description, status) => {
    const [result] = await db.query(
      'INSERT INTO tasks (project_id, title, description, status) VALUES (?, ?, ?, ?)',
      [projectId, title, description, status]
    );
    return { id: result.insertId, projectId, title, description, status };
  },
  updateStatus: async (id, status) => {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
  },
  updateDetails: async (taskId, title, description) => {
    await db.query('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, taskId]);
  },
  addUserToTask: async (taskId, userId) => {
    await db.query('INSERT IGNORE INTO task_users (task_id, user_id) VALUES (?, ?)', [taskId, userId]);
  },
  updateDeadline: async (taskId, deadline) => {
    await db.query(
      'UPDATE tasks SET deadline = ? WHERE id = ?',
      [deadline, taskId]
    );
  },

  getAllDeadlines: async () => {
    const [tasks] = await db.query(
      `SELECT t.id, t.title, t.status, t.deadline, p.name as project_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.deadline IS NOT NULL`
    );
    return tasks;
  },

  getByProjectIdWithDeadline: async (projectId) => {
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE project_id = ?',
      [projectId]
    );
    return tasks;
  },

};

module.exports = Task;