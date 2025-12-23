const sql = require("../config/db");

async function checkRegistrations() {
  try {
    console.log("🔍 Başvurular kontrol ediliyor...\n");

    // Tüm başvuruları listele
    const registrations = await sql`
      SELECT 
        sr.id,
        sr.offering_id,
        sr.status,
        sr.application_date,
        so.course_name,
        so.course_code,
        so.academician_id,
        u.first_name || ' ' || u.last_name as student_name,
        s.student_number
      FROM summer_school_registrations sr
      JOIN summer_school_offerings so ON sr.offering_id = so.id
      JOIN students s ON sr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY sr.application_date DESC
      LIMIT 20
    `;

    if (registrations.length === 0) {
      console.log("❌ Hiç başvuru bulunamadı!\n");
      console.log("💡 Öğrenci girişi yapıp başvuru yaptığınızdan emin olun.");
      return;
    }

    console.log(`✅ ${registrations.length} başvuru bulundu:\n`);
    console.log("─".repeat(100));

    registrations.forEach((reg, index) => {
      console.log(`\n${index + 1}. Başvuru ID: ${reg.id}`);
      console.log(`   Ders: ${reg.course_name} (${reg.course_code})`);
      console.log(`   Öğrenci: ${reg.student_name} (${reg.student_number})`);
      console.log(`   Durum: ${reg.status}`);
      console.log(`   Offering ID: ${reg.offering_id}`);
      console.log(`   Academician ID: ${reg.academician_id}`);
      console.log(`   Tarih: ${new Date(reg.application_date).toLocaleString('tr-TR')}`);
    });

    console.log("\n" + "─".repeat(100));

    // Akademisyenlere göre grupla
    const byAcademician = {};
    registrations.forEach(reg => {
      if (!byAcademician[reg.academician_id]) {
        byAcademician[reg.academician_id] = [];
      }
      byAcademician[reg.academician_id].push(reg);
    });

    console.log("\n📊 Akademisyenlere göre dağılım:");
    for (const [academicianId, apps] of Object.entries(byAcademician)) {
      console.log(`\n   Academician ID ${academicianId}: ${apps.length} başvuru`);
      apps.forEach(app => {
        console.log(`      - ${app.course_name} (${app.course_code}): ${app.status}`);
      });
    }

    // Offering ID'lere göre grupla
    const byOffering = {};
    registrations.forEach(reg => {
      if (!byOffering[reg.offering_id]) {
        byOffering[reg.offering_id] = [];
      }
      byOffering[reg.offering_id].push(reg);
    });

    console.log("\n📊 Offering ID'lere göre dağılım:");
    for (const [offeringId, apps] of Object.entries(byOffering)) {
      console.log(`\n   Offering ID ${offeringId}: ${apps.length} başvuru`);
      apps.forEach(app => {
        console.log(`      - ${app.student_name}: ${app.status}`);
      });
    }

  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkRegistrations();



