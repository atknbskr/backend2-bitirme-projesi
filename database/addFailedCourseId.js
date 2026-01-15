const sql = require("../config/db");

async function addFailedCourseIdColumn() {
  try {
    console.log("🔍 summer_school_registrations tablosuna failed_course_id kolonu ekleniyor...\n");

    // Önce kolonun var olup olmadığını kontrol et
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'summer_school_registrations' 
        AND column_name = 'failed_course_id'
      );
    `;

    if (columnExists[0].exists) {
      console.log("✅ failed_course_id kolonu zaten mevcut!\n");
      
      // Tablo yapısını göster
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'summer_school_registrations'
        ORDER BY ordinal_position;
      `;
      
      console.log("📋 Tablo yapısı:");
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      process.exit(0);
      return;
    }

    console.log("⚠️ failed_course_id kolonu bulunamadı. Ekleniyor...\n");

    // Önce student_failed_courses tablosunun var olup olmadığını kontrol et
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'student_failed_courses'
      );
    `;

    if (tableExists[0].exists) {
      // Foreign key ile ekle
      await sql`
        ALTER TABLE summer_school_registrations
        ADD COLUMN failed_course_id INTEGER REFERENCES student_failed_courses(id) ON DELETE SET NULL;
      `;
      console.log("✅ failed_course_id kolonu başarıyla eklendi (foreign key ile)!\n");
    } else {
      // Foreign key olmadan ekle
      await sql`
        ALTER TABLE summer_school_registrations
        ADD COLUMN failed_course_id INTEGER;
      `;
      console.log("✅ failed_course_id kolonu başarıyla eklendi (foreign key olmadan)!\n");
      console.log("⚠️ Not: student_failed_courses tablosu bulunamadı, foreign key eklenmedi.\n");
    }

    // Tablo yapısını tekrar göster
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'summer_school_registrations'
      ORDER BY ordinal_position;
    `;

    console.log("📋 Güncel tablo yapısı:");
    console.log("─".repeat(60));
    columns.forEach(col => {
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("─".repeat(60));

    console.log("\n✅ İşlem tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addFailedCourseIdColumn();
















