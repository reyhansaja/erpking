require('dotenv').config();
const mysql = require('mysql2/promise');

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
    throw new Error('DATABASE_URL tidak valid.');
  }
}

async function migrate() {
  const config = parseDbUrl(process.env.DATABASE_URL);
  const connection = await mysql.createConnection({
    ...config,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('=== Mulai Migrasi Database ERPKu (MySQL Hostinger) ===\n');

    // 1. Cek & tambah kolom 'role' ke tabel users
    const [userCols] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (userCols.length === 0) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('USER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'USER'
      `);
      console.log("✅ Kolom 'role' berhasil ditambahkan ke tabel users");
    } else {
      console.log("ℹ️  Kolom 'role' sudah ada di tabel users, dilewati.");
    }

    // 2. Cek & tambah kolom 'title' ke tabel bug_notes
    const [bugCols] = await connection.query("SHOW COLUMNS FROM bug_notes LIKE 'title'");
    if (bugCols.length === 0) {
      await connection.query(`
        ALTER TABLE bug_notes 
        ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '' AFTER project_id
      `);
      console.log("✅ Kolom 'title' berhasil ditambahkan ke tabel bug_notes");
    } else {
      console.log("ℹ️  Kolom 'title' sudah ada di tabel bug_notes, dilewati.");
    }

    // 3. Perbaiki ENUM type di bug_notes agar support 'FEATURE' dan 'BUG' (uppercase)
    await connection.query(`
      ALTER TABLE bug_notes 
      MODIFY COLUMN type ENUM('FEATURE', 'BUG', 'feature', 'bug') NOT NULL
    `);
    console.log("✅ ENUM 'type' di bug_notes diperbarui (support FEATURE/BUG uppercase)");

    console.log('\n🎉 Migrasi selesai! Semua kolom sudah siap di database.');
  } catch (error) {
    console.error('❌ Migrasi gagal:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

migrate();
