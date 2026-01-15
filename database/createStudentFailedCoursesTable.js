const sql = require("../config/db");
require("dotenv").config();

async function createStudentFailedCoursesTable() {
  try {
    console.log("📋 student_failed_courses tablosu oluşturuluyor...");

    // Tabloyu oluştur
    await sql`
      CREATE TABLE IF NOT EXISTS student_failed_courses (
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
    console.log("📊 İndeksler oluşturuluyor...");

    await sql`
      CREATE INDEX IF NOT EXISTS idx_student_failed_courses_student_id 
      ON student_failed_courses(student_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_student_failed_courses_course_code 
      ON student_failed_courses(course_code)
    `;

    console.log("✅ İndeksler oluşturuldu!");

    console.log("\n🎉 student_failed_courses tablosu başarıyla oluşturuldu!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

createStudentFailedCoursesTable();















