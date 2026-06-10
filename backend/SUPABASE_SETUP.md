# Supabase Setup untuk ERPKing

## 1. Buat proyek Supabase
1. Masuk ke https://app.supabase.com
2. Buat project baru
3. Pilih region dan beri nama project

## 2. Buat database schema di Supabase
1. Buka menu `SQL Editor`
2. Buat query baru
3. Copy seluruh isi `backend/supabase_schema.sql`
4. Jalankan query

> Ini akan membuat tabel:
> - users
> - projects
> - project_users
> - tasks
> - task_users
> - chats
> - bug_notes
> - reminders

## 3. Konfigurasi koneksi di aplikasi backend
1. Ambil `Database URL` dari Supabase (`Settings > Database > Connection string`)
2. Isi environment variable di deployment kamu:

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require"
```

3. Pastikan `backend/db.js` menggunakan `process.env.DATABASE_URL` (sudah ada di repo)

## 4. Sambungkan Supabase ke GCP
Ada dua cara umum:

### A. Aplikasi di GCP langsung memakai database Postgres Supabase
1. Simpan `DATABASE_URL` sebagai secret di GCP Secret Manager
2. Di Cloud Run / App Engine / Compute Engine, set environment variable `DATABASE_URL` dari secret
3. Pastikan outbound network GCP boleh mengakses host Supabase (internet access aktif)

### B. Jika pakai Supabase API saja
1. Ambil `SUPABASE_URL` dan `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
2. Panggil API Supabase dari aplikasi GCP menggunakan SDK atau HTTP request
3. Hati-hati: gunakan `SERVICE_ROLE_KEY` hanya di server, bukan di frontend

## 5. Tes koneksi
1. Jalankan aplikasi backend dengan `DATABASE_URL` Supabase
2. Pastikan API dapat melakukan operasi CRUD ke tabel
3. Contoh test endpoint: daftar project, buat task, kirim chat

## Catatan
- Supabase menggunakan PostgreSQL, bukan MySQL.
- SQL schema sudah dikonversi ke PostgreSQL di `backend/supabase_schema.sql`.
- Jika ingin migrasi data lama, gunakan `pg_dump` / export/import data dari MySQL ke Postgres sesuai kebutuhan.
