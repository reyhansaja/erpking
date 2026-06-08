const mysql = require('mysql2/promise');

async function migrateTodos() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'erpku_db'
    });

    console.log('Connected to database.');

    const createTodosTable = `
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        is_done BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.query(createTodosTable);
    console.log('✅ Table "todos" created (or already exists).');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

migrateTodos();
