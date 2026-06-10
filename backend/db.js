const { Pool } = require('pg');

// Koneksi khusus Supabase wajib pakai SSL g
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  query: async (text, params) => {
    // 1. Ubah tanda '?' khas MySQL jadi '$1, $2' khas Postgres
    let i = 1;
    let pgQuery = text.replace(/\?/g, () => `$${i++}`);
    
    // Postgres tidak kenal "INSERT IGNORE", otomatis kita ubah bahasanya
    if (pgQuery.toUpperCase().includes('INSERT IGNORE INTO')) {
      pgQuery = pgQuery.replace(/INSERT IGNORE INTO/ig, 'INSERT INTO');
      pgQuery += ' ON CONFLICT DO NOTHING';
    }

    // 2. Kalau ada INSERT, paksa Postgres balikin data barunya (RETURNING)
    if (pgQuery.trim().toUpperCase().startsWith('INSERT') && !pgQuery.toUpperCase().includes('RETURNING')) {
      pgQuery += ' RETURNING *';
    }

    const res = await pool.query(pgQuery, params);
    
    // 3. Akali format output biar sama persis kayak mysql2
    // Jadi file userModel, projectModel, dll punyamu aman dari eror!
    const rows = res.rows || [];
    if (res.command === 'INSERT' && rows.length > 0) {
      rows.insertId = rows[0].id; 
    }
    
    return [rows, res.fields];
  }
};