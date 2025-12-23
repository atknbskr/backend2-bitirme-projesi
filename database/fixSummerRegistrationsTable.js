const sql = require("../config/db");

async function fixSummerRegistrationsTable() {
  try {
    console.log("🔍 summer_school_registrations tablosu kontrol ediliyor...\n");

    // failed_course_id kolonu var mı kontrol et
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'summer_school_registrations' 
        AND column_name = 'failed_course_id'
      );
    `;

    if (!columnExists[0].exists) {
      console.log("⚠️ failed_course_id kolonu bulunamadı. Ekleniyor...");
      
      try {
        await sql`
          ALTER TABLE summer_school_registrations
          ADD COLUMN failed_course_id INTEGER REFERENCES student_failed_courses(id) ON DELETE SET NULL;
        `;
        
        console.log("✅ failed_course_id kolonu başarıyla eklendi!\n");
      } catch (error) {
        // Eğer student_failed_courses tablosu yoksa, foreign key olmadan ekle
        if (error.message.includes('student_failed_courses')) {
          console.log("⚠️ student_failed_courses tablosu bulunamadı. Foreign key olmadan ekleniyor...");
          await sql`
            ALTER TABLE summer_school_registrations
            ADD COLUMN failed_course_id INTEGER;
          `;
          console.log("✅ failed_course_id kolonu eklendi (foreign key olmadan)!\n");
        } else {
          throw error;
        }
      }
    } else {
      console.log("✅ failed_course_id kolonu mevcut.\n");
    }

    // Tablo yapısını tekrar göster
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

    console.log("📋 Güncel tablo yapısı:");
    console.log("─".repeat(80));
    columns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("─".repeat(80));

    console.log("\n✅ Tablo kontrolü tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

fixSummerRegistrationsTable();

