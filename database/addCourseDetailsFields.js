const sql = require("../config/db");
require("dotenv").config();

async function addCourseDetailsFields() {
  try {
    console.log("🔧 Courses tablosuna detay alanları ekleniyor...\n");

    // Courses tablosuna yeni alanlar ekle
    console.log("📝 credits alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3
    `;
    console.log("✅ credits alanı eklendi\n");

    console.log("📝 price alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0
    `;
    console.log("✅ price alanı eklendi\n");

    console.log("📝 course_hours alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS course_hours INTEGER DEFAULT 42
    `;
    console.log("✅ course_hours alanı eklendi\n");

    console.log("📝 quota alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS quota INTEGER DEFAULT 30
    `;
    console.log("✅ quota alanı eklendi\n");

    console.log("📝 requirements alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS requirements TEXT
    `;
    console.log("✅ requirements alanı eklendi\n");

    console.log("📝 equivalency_info alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS equivalency_info TEXT
    `;
    console.log("✅ equivalency_info alanı eklendi\n");

    console.log("=".repeat(70));
    console.log("✅ Courses tablosu başarıyla güncellendi!");
    console.log("=".repeat(70));
    console.log("\nEklenen alanlar:");
    console.log("  - credits: Ders kredi sayısı (varsayılan: 3)");
    console.log("  - price: Ders ücreti (varsayılan: 0)");
    console.log("  - course_hours: Ders saati (varsayılan: 42)");
    console.log("  - quota: Kontenjan (varsayılan: 30)");
    console.log("  - requirements: Ön koşullar");
    console.log("  - equivalency_info: Denklik bilgisi");

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

addCourseDetailsFields();

