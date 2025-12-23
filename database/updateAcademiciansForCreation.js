const sql = require("../config/db");
require("dotenv").config();

async function updateAcademiciansTable() {
  try {
    console.log("🔧 Akademisyenler tablosu güncelleniyor...\n");

    // Akademisyen tablosuna university_id ve title alanlarını ekle
    console.log("📝 university_id alanı ekleniyor...");
    await sql`
      ALTER TABLE academicians
      ADD COLUMN IF NOT EXISTS university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL
    `;
    console.log("✅ university_id alanı eklendi\n");

    console.log("📝 title alanı ekleniyor...");
    await sql`
      ALTER TABLE academicians
      ADD COLUMN IF NOT EXISTS title VARCHAR(100)
    `;
    console.log("✅ title alanı eklendi\n");

    console.log("📝 office alanı ekleniyor...");
    await sql`
      ALTER TABLE academicians
      ADD COLUMN IF NOT EXISTS office VARCHAR(200)
    `;
    console.log("✅ office alanı eklendi\n");

    console.log("📝 office_hours alanı ekleniyor...");
    await sql`
      ALTER TABLE academicians
      ADD COLUMN IF NOT EXISTS office_hours VARCHAR(200)
    `;
    console.log("✅ office_hours alanı eklendi\n");

    console.log("📝 department alanı ekleniyor...");
    await sql`
      ALTER TABLE academicians
      ADD COLUMN IF NOT EXISTS department VARCHAR(200)
    `;
    console.log("✅ department alanı eklendi\n");

    // Courses tablosuna university_id alanını ekle
    console.log("📝 courses tablosuna university_id alanı ekleniyor...");
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL
    `;
    console.log("✅ courses university_id alanı eklendi\n");

    console.log("=".repeat(70));
    console.log("✅ Akademisyenler ve Courses tablosu başarıyla güncellendi!");
    console.log("=".repeat(70));
    console.log("\nEklenen alanlar:");
    console.log("  Academicians:");
    console.log("    - university_id: Akademisyenin bağlı olduğu üniversite");
    console.log("    - title: Akademik ünvan (Prof. Dr., Doç. Dr. vb.)");
    console.log("    - office: Ofis bilgisi");
    console.log("    - office_hours: Ofis saatleri");
    console.log("    - department: Bölüm bilgisi");
    console.log("\n  Courses:");
    console.log("    - university_id: Dersin verildiği üniversite");

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

updateAcademiciansTable();




