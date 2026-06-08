const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'erpku_db' });
    await connection.query('DROP TABLE IF EXISTS chats');
    await connection.query(`
      CREATE TABLE chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Chats table migrated successfully.');
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}
migrate();
