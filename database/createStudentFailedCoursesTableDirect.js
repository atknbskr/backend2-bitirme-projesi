const sql = require("../config/db");
require("dotenv").config();

async function createTable() {
  try {
    console.log("📋 student_failed_courses tablosu kontrol ediliyor ve oluşturuluyor...");

    // Önce tablonun var olup olmadığını kontrol et
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'student_failed_courses'
      )
    `;

    if (tableExists[0].exists) {
      console.log("✅ student_failed_courses tablosu zaten mevcut!");
      process.exit(0);
    }

    // Tabloyu oluştur
    await sql`
      CREATE TABLE student_failed_courses (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(50),
        semester VARCHAR(50),
        academic_year VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_code, academic_year)
      )
    `;

    console.log("✅ student_failed_courses tablosu oluşturuldu!");

    // İndeksleri oluştur
    await sql`
      CREATE INDEX IF NOT EXISTS idx_student_failed_courses_student_id 
      ON student_failed_courses(student_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_student_failed_courses_course_code 
      ON student_failed_courses(course_code)
    `;

    console.log("✅ İndeksler oluşturuldu!");
    console.log("\n🎉 Başarılı! Artık başvurular görüntülenebilir.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    if (error.message.includes("relation") && error.message.includes("already exists")) {
      console.log("ℹ️ Tablo zaten mevcut, sorun yok.");
      process.exit(0);
    }
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

createTable();
















