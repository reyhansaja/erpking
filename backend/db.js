const mysql = require('mysql2/promise');

// Parse DATABASE_URL format: mysql://user:pass@host:port/dbname
function parseDbUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 3306,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.replace('/', ''),
    };
  } catch (e) {
    throw new Error('DATABASE_URL tidak valid. Format: mysql://user:pass@host:port/dbname');
  }
}

const config = parseDbUrl(process.env.DATABASE_URL);

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false } // Aman untuk Hostinger
});

module.exports = {
  query: async (text, params) => {
    const [rows, fields] = await pool.execute(text, params || []);
    // Agar kompatibel: tambahkan insertId di rows jika INSERT
    if (rows && rows.insertId !== undefined) {
      rows.insertId = rows.insertId;
    }
    return [rows, fields];
  }
};