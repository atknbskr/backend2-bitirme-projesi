// Veritabanı tablolarını otomatik oluşturma script'i
// Kullanım: node backend/database/initDatabase.js

require("dotenv").config();
const sql = require("../config/db");

async function initDatabase() {
  console.log("🔄 Veritabanı tabloları oluşturuluyor...\n");

  try {
    // Users tablosu
    console.log("📝 Users tablosu oluşturuluyor...");
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'academician', 'admin')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Users tablosu oluşturuldu\n");

    // Students tablosu
    console.log("📝 Students tablosu oluşturuluyor...");
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        student_number VARCHAR(20) UNIQUE NOT NULL
      )
    `;
    console.log("✅ Students tablosu oluşturuldu\n");

    // Academicians tablosu
    console.log("📝 Academicians tablosu oluşturuluyor...");
    await sql`
      CREATE TABLE IF NOT EXISTS academicians (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE NOT NULL
      )
    `;
    console.log("✅ Academicians tablosu oluşturuldu\n");

    // Admins tablosu
    console.log("📝 Admins tablosu oluşturuluyor...");
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        admin_code VARCHAR(50) UNIQUE NOT NULL,
        is_super_admin BOOLEAN DEFAULT FALSE
      )
    `;
    console.log("✅ Admins tablosu oluşturuldu\n");

    // Courses tablosu (ÖNEMLİ!)
    console.log("📝 Courses tablosu oluşturuluyor...");
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        academician_id INTEGER REFERENCES academicians(id) ON DELETE CASCADE,
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(50),
        description TEXT,
        category VARCHAR(100),
        university_count INTEGER DEFAULT 0,
        student_count INTEGER DEFAULT 0,
        application_deadline DATE,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Courses tablosu oluşturuldu\n");

    // Favorites tablosu
    console.log("📝 Favorites tablosu oluşturuluyor...");
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      )
    `;
    console.log("✅ Favorites tablosu oluşturuldu\n");

    // İndeksler
    console.log("📝 İndeksler oluşturuluyor...");
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_students_student_number ON students(student_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_academicians_username ON academicians(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admins_admin_code ON admins(admin_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_courses_academician_id ON courses(academician_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_courses_application_deadline ON courses(application_deadline)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_favorites_student_id ON favorites(student_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id)`;
    console.log("✅ İndeksler oluşturuldu\n");

    // Kontrol
    console.log("🔍 Tablolar kontrol ediliyor...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'students', 'academicians', 'admins', 'courses', 'favorites')
      ORDER BY table_name
    `;

    console.log("\n📊 Oluşturulan tablolar:");
    tables.forEach((table) => {
      console.log(`   ✓ ${table.table_name}`);
    });

    console.log("\n🎉 Veritabanı başarıyla hazırlandı!");
    console.log("\n💡 Şimdi ders ekleyebilirsiniz!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Hata oluştu:", error.message);
    console.error("\n🔍 Detaylar:", error);
    process.exit(1);
  }
}

// Script'i çalıştır
initDatabase();

