const sql = require("../config/db");

async function updateAcademiciansTable() {
  try {
    console.log("Akademisyenler tablosuna yeni alanlar ekleniyor...");

    // Akademisyen tablosuna title, office, office_hours, department alanlarını ekle
    await sql`
      ALTER TABLE academicians
      ADD COLUMN IF NOT EXISTS title VARCHAR(100),
      ADD COLUMN IF NOT EXISTS office VARCHAR(200),
      ADD COLUMN IF NOT EXISTS office_hours VARCHAR(200),
      ADD COLUMN IF NOT EXISTS department VARCHAR(200)
    `;

    console.log("✅ Akademisyenler tablosu başarıyla güncellendi!");
    console.log("Eklenen alanlar:");
    console.log("  - title: Akademik ünvan (Doç. Dr., Prof. Dr. vb.)");
    console.log("  - office: Ofis bilgisi");
    console.log("  - office_hours: Ofis saatleri");
    console.log("  - department: Bölüm bilgisi");

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

updateAcademiciansTable();

