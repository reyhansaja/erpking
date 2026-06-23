const db = require('../db');

const folderController = {
    getUserFolders: async (req, res) => {
        try {
            const { userId } = req.params;
            // Ambil semua folder milik user ini
            const [folders] = await db.query('SELECT * FROM folders WHERE user_id = ? ORDER BY created_at ASC', [userId]);
            res.json(folders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createFolder: async (req, res) => {
        try {
            const { name, userId } = req.body;
            const [result] = await db.query('INSERT INTO folders (name, user_id) VALUES (?, ?)', [name, userId]);

            // Kembalikan data folder yang baru dibuat agar frontend langsung render
            const [newFolder] = await db.query('SELECT * FROM folders WHERE id = ?', [result.insertId]);
            res.json(newFolder[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = folderController;