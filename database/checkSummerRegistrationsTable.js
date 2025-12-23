const sql = require("../config/db");

async function checkSummerRegistrationsTable() {
  try {
    console.log("🔍 summer_school_registrations tablosu kontrol ediliyor...\n");

    // Tablo var mı kontrol et
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'summer_school_registrations'
      );
    `;

    if (!tableExists[0].exists) {
      console.log("❌ summer_school_registrations tablosu bulunamadı!");
      console.log("\n📝 Tabloyu oluşturmak için:");
      console.log("1. Neon Dashboard'a gidin");
      console.log("2. SQL Editor'ü açın");
      console.log("3. backend/database/createSummerSchoolTables.sql dosyasındaki SQL'i çalıştırın\n");
      return;
    }

    console.log("✅ summer_school_registrations tablosu mevcut!\n");

    // Tablo yapısını göster
    const columns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'summer_school_registrations'
      ORDER BY ordinal_position;
    `;

    console.log("📋 Tablo yapısı:");
    console.log("─".repeat(80));
    columns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("─".repeat(80));

    // Kayıt sayısını göster
    const count = await sql`
      SELECT COUNT(*) as count FROM summer_school_registrations
    `;
    console.log(`\n📊 Toplam başvuru sayısı: ${count[0].count}`);

    // İndeksleri kontrol et
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'summer_school_registrations';
    `;

    if (indexes.length > 0) {
      console.log("\n🔍 İndeksler:");
      indexes.forEach(idx => {
        console.log(`  - ${idx.indexname}`);
      });
    }

    console.log("\n✅ Tablo kontrolü tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkSummerRegistrationsTable();



