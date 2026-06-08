const Reminder = require('../models/reminderModel');

const reminderController = {
  getUserReminders: async (req, res) => {
    try {
      const reminders = await Reminder.getByUserId(req.params.userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createReminder: async (req, res) => {
    try {
      const { userId, title, description, reminderDate } = req.body;
      const newReminder = await Reminder.create(userId, title, description, reminderDate);
      res.json(newReminder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reminderController;
