const sql = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runStudentCoursesTable() {
  try {
    console.log("📚 student_courses tablosu oluşturuluyor...");

    // Tabloyu oluştur
    await sql`
      CREATE TABLE IF NOT EXISTS student_courses (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
        summer_offering_id INTEGER REFERENCES summer_school_offerings(id) ON DELETE SET NULL,
        registration_id INTEGER REFERENCES summer_school_registrations(id) ON DELETE CASCADE,
        
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(50) NOT NULL,
        university_name VARCHAR(255),
        credits INTEGER,
        
        enrollment_type VARCHAR(20) NOT NULL DEFAULT 'summer_school' CHECK (enrollment_type IN ('summer_school', 'regular', 'transfer')),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'withdrawn')),
        grade VARCHAR(5),
        
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        
        UNIQUE(student_id, course_code)
      );
    `;

    console.log("✅ student_courses tablosu oluşturuldu!");

    // İndeksler oluştur
    await sql`CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_courses_status ON student_courses(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_student_courses_enrollment_type ON student_courses(enrollment_type);`;

    console.log("✅ İndeksler oluşturuldu!");

    // Tabloyu kontrol et
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'student_courses'
      );
    `;

    console.log("📊 Tablo kontrolü:", tableCheck[0].exists ? "✓ Mevcut" : "✗ Yok");

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

runStudentCoursesTable();

