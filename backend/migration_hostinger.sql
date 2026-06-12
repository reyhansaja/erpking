-- ============================================================
-- MIGRATION: ERPKu - Tambah kolom role & title
-- Jalankan script ini di phpMyAdmin Hostinger kamu
-- Panel: hPanel > Databases > phpMyAdmin
-- ============================================================

-- 1. Tambah kolom 'role' ke tabel users (jika belum ada)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('USER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'USER';

-- 2. Tambah kolom 'title' ke tabel bug_notes (jika belum ada)
ALTER TABLE bug_notes 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT '' AFTER project_id;

-- 3. Update ENUM 'type' di bug_notes agar support uppercase FEATURE/BUG
--    (frontend mengirim 'FEATURE' dan 'BUG' dengan huruf kapital)
ALTER TABLE bug_notes 
MODIFY COLUMN type ENUM('FEATURE', 'BUG', 'feature', 'bug') NOT NULL;

-- Verifikasi hasil
SELECT 'Migrasi selesai!' AS status;
DESCRIBE users;
DESCRIBE bug_notes;
