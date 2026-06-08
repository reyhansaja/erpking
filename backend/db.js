const mysql = require('mysql2/promise');

const DATABASE_URL = process.env.DATABASE_URL;

const pool = mysql.createPool({
  uri: DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
