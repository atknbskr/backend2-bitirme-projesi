// course_registrations tablosunun varlığını kontrol etme script'i
// Kullanım: node backend/database/checkCourseRegistrationsTable.js

require("dotenv").config();
const sql = require("../config/db");

async function checkTable() {
  console.log("🔍 course_registrations tablosu kontrol ediliyor...\n");

  try {
    // Tablo var mı kontrol et
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'course_registrations'
      )
    `;

    if (tableExists[0].exists) {
      console.log("✅ course_registrations tablosu mevcut!\n");
      
      // Tablo yapısını göster
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'course_registrations'
        ORDER BY ordinal_position
      `;
      
      console.log("📋 Tablo yapısı:");
      console.table(columns);
      
      // Kayıt sayısını göster
      const count = await sql`SELECT COUNT(*) as count FROM course_registrations`;
      console.log(`\n📊 Toplam başvuru sayısı: ${count[0].count}`);
      
    } else {
      console.log("❌ course_registrations tablosu bulunamadı!\n");
      console.log("📝 Tabloyu oluşturmak için:");
      console.log("   1. Neon Dashboard > SQL Editor'e gidin");
      console.log("   2. backend/database/createCourseRegistrationsTable.sql dosyasını açın");
      console.log("   3. SQL komutlarını çalıştırın\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    process.exit(1);
  }
}

checkTable();





