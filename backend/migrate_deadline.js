const db = require('./db');

async function migrate() {
    await db.query(`
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS deadline DATE NULL,
        ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0
    `);
    console.log('Migration selesai: kolom deadline & progress ditambahkan');
    process.exit(0);
}

migrate().catch(console.error);