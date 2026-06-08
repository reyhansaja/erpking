const db = require('../db');

const Reminder = {
  getByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM reminders WHERE user_id = ?', [userId]);
    return rows;
  },
  create: async (userId, title, description, reminderDate) => {
    const [result] = await db.query(
      'INSERT INTO reminders (user_id, title, description, reminder_date) VALUES (?, ?, ?, ?)',
      [userId, title, description, reminderDate]
    );
    return { id: result.insertId, title, reminderDate };
  }
};

module.exports = Reminder;
