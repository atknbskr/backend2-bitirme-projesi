const sql = require("../config/db");
require("dotenv").config();

async function reassignCourses() {
  try {
    console.log("🔄 Dersler akademisyenlere yeniden atanıyor...\n");

    // Önce tüm derslerin atamasını kaldır
    console.log("📝 Mevcut ders atamaları kaldırılıyor...");
    const result = await sql`
      UPDATE courses 
      SET academician_id = NULL
      WHERE academician_id IS NOT NULL
    `;
    console.log(`✅ ${result.count} dersin ataması kaldırıldı\n`);

    // Tüm akademisyenleri al
    const academicians = await sql`
      SELECT 
        a.id,
        a.title,
        u.first_name,
        u.last_name
      FROM academicians a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.id
    `;

    if (academicians.length === 0) {
      console.log("⚠️  Veritabanında akademisyen bulunamadı!");
      process.exit(1);
    }

    console.log(`👨‍🏫 ${academicians.length} akademisyen bulundu\n`);

    // Tüm dersleri al
    const courses = await sql`
      SELECT id, course_name, course_code 
      FROM courses 
      ORDER BY id
    `;

    if (courses.length === 0) {
      console.log("⚠️  Veritabanında ders bulunamadı!");
      process.exit(1);
    }

    console.log(`📚 ${courses.length} ders bulundu\n`);
    console.log("📋 Dersler akademisyenlere dağıtılıyor...\n");

    // Dersleri akademisyenlere eşit şekilde dağıt (round-robin)
    let assignedCount = 0;
    const assignmentStats = {};

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const academician = academicians[i % academicians.length];
      
      try {
        await sql`
          UPDATE courses 
          SET academician_id = ${academician.id}
          WHERE id = ${course.id}
        `;

        const academicianName = `${academician.title || ''} ${academician.first_name} ${academician.last_name}`.trim();
        
        // İstatistikleri güncelle
        if (!assignmentStats[academician.id]) {
          assignmentStats[academician.id] = {
            name: academicianName,
            count: 0
          };
        }
        assignmentStats[academician.id].count++;

        console.log(`✅ ${course.course_name} (${course.course_code || 'Kod Yok'}) → ${academicianName}`);
        assignedCount++;

      } catch (error) {
        console.error(`❌ ${course.course_name} atanamadı:`, error.message);
      }
    }

    // Özet bilgileri
    console.log("\n" + "=".repeat(70));
    console.log(`📊 Ders Atama Özeti:`);
    console.log(`   ✅ Toplam Atanan Ders: ${assignedCount}`);
    console.log(`   👨‍🏫 Akademisyen Sayısı: ${academicians.length}`);
    console.log(`   📚 Toplam Ders: ${courses.length}`);
    console.log("=".repeat(70));

    // Her akademisyene kaç ders atandığını göster
    console.log("\n👥 Akademisyen Başına Ders Dağılımı:\n");
    Object.values(assignmentStats).forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.name}: ${stat.count} ders`);
    });

    console.log("\n✨ Dersler başarıyla yeniden dağıtıldı!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

reassignCourses();


















