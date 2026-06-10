const express = require('express');
const router = express.Router();
// Ganti baris import paling atas di file backend/routes/bugNoteRoutes.js kamu g:
const bugNoteController = require('../controllers/bugNoteController.js');
router.put('/:id/toggle', bugNoteController.toggleNoteStatus);

module.exports = router;
