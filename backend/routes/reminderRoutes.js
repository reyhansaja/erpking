const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

router.get('/:userId', reminderController.getUserReminders);
router.post('/', reminderController.createReminder);

module.exports = router;
