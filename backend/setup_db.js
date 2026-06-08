const mysql = require('mysql2/promise');

async function setupDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('Connected to MySQL server.');

    await connection.query('DROP DATABASE IF EXISTS erpku_db');
    await connection.query('CREATE DATABASE erpku_db');
    await connection.query('USE erpku_db');

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        invite_token VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createProjectUsersTable = `
      CREATE TABLE IF NOT EXISTS project_users (
        project_id INT,
        user_id INT,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('on_progress', 'hold', 'done') DEFAULT 'on_progress',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `;

    const createTaskUsersTable = `
      CREATE TABLE IF NOT EXISTS task_users (
        task_id INT,
        user_id INT,
        PRIMARY KEY (task_id, user_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createChatsTable = `
      CREATE TABLE IF NOT EXISTS chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createBugNotesTable = `
      CREATE TABLE IF NOT EXISTS bug_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        type ENUM('feature', 'bug') NOT NULL,
        content TEXT NOT NULL,
        is_crossed_out BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `;

    const createRemindersTable = `
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reminder_date DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.query(createUsersTable);
    await connection.query(createProjectsTable);
    await connection.query(createProjectUsersTable);
    await connection.query(createTasksTable);
    await connection.query(createTaskUsersTable);
    await connection.query(createChatsTable);
    await connection.query(createBugNotesTable);
    await connection.query(createRemindersTable);

    console.log('Database and tables created successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDB();
