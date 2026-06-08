const express = require('express');
const router = express.Router();
const bugNoteController = require('../controllers/bugNoteController');

router.put('/:id/toggle', bugNoteController.toggleNoteStatus);

module.exports = router;
