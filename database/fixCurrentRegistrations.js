const sql = require("../config/db");

async function fixCurrentRegistrations() {
  try {
    console.log("🔍 current_registrations değerleri düzeltiliyor...\n");

    // Tüm summer_school_offerings'leri al
    const offerings = await sql`
      SELECT id, course_name, current_registrations, quota
      FROM summer_school_offerings
      ORDER BY id
    `;

    console.log(`📚 Toplam ${offerings.length} teklif bulundu.\n`);

    let fixedCount = 0;

    for (const offering of offerings) {
      // Her teklif için onaylanmış başvuru sayısını hesapla
      const approvedCount = await sql`
        SELECT COUNT(*) as count
        FROM summer_school_registrations
        WHERE offering_id = ${offering.id} AND status = 'approved'
      `;

      const actualCount = parseInt(approvedCount[0].count) || 0;
      const currentCount = offering.current_registrations || 0;

      if (actualCount !== currentCount) {
        console.log(`🔄 "${offering.course_name}" (ID: ${offering.id})`);
        console.log(`   Eski: ${currentCount} → Yeni: ${actualCount}`);

        await sql`
          UPDATE summer_school_offerings
          SET current_registrations = ${actualCount}
          WHERE id = ${offering.id}
        `;

        fixedCount++;
      }
    }

    console.log(`\n✅ ${fixedCount} teklif düzeltildi.`);
    console.log(`📊 ${offerings.length - fixedCount} teklif zaten doğruydu.`);

    // Özet
    const summary = await sql`
      SELECT 
        COUNT(*) as total_offerings,
        SUM(current_registrations) as total_registrations,
        SUM(quota) as total_quota
      FROM summer_school_offerings
    `;

    console.log("\n📊 Özet:");
    console.log(`   Toplam Teklif: ${summary[0].total_offerings}`);
    console.log(`   Toplam Kayıtlı Öğrenci: ${summary[0].total_registrations}`);
    console.log(`   Toplam Kontenjan: ${summary[0].total_quota}`);

  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

fixCurrentRegistrations();








