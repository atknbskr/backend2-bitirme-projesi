const sql = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runFacultiesMigration() {
  try {
    console.log("🚀 Fakülteler tablosu migration başlatılıyor...");

    // Fakülteler tablosunu oluştur
    await sql`
      CREATE TABLE IF NOT EXISTS faculties (
        id SERIAL PRIMARY KEY,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        academician_id INTEGER REFERENCES academicians(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("✅ Fakülteler tablosu oluşturuldu");

    // İndeksleri oluştur
    await sql`CREATE INDEX IF NOT EXISTS idx_faculties_university_id ON faculties(university_id)`;
    console.log("✅ university_id indeksi oluşturuldu");

    await sql`CREATE INDEX IF NOT EXISTS idx_faculties_academician_id ON faculties(academician_id)`;
    console.log("✅ academician_id indeksi oluşturuldu");

    console.log("✅ Fakülteler tablosu migration tamamlandı!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration hatası:", error);
    process.exit(1);
  }
}

runFacultiesMigration();

