// Akademisyeni olmayan derslere akademisyen atama script'i
// Kullanım: node backend/database/assignAcademiciansToCourses.js

require("dotenv").config();
const sql = require("../config/db");

async function assignAcademicians() {
  console.log("🔍 Akademisyeni olmayan dersler kontrol ediliyor...\n");

  try {
    // Akademisyeni olmayan dersleri bul
    const coursesWithoutAcademician = await sql`
      SELECT id, course_name, course_code, category
      FROM courses
      WHERE academician_id IS NULL
      ORDER BY id
    `;

    console.log(`📊 Akademisyeni olmayan ders sayısı: ${coursesWithoutAcademician.length}\n`);

    if (coursesWithoutAcademician.length === 0) {
      console.log("✅ Tüm derslerin akademisyeni var!\n");
      process.exit(0);
    }

    // Mevcut akademisyenleri al
    const academicians = await sql`
      SELECT a.id, a.user_id, u.first_name, u.last_name, a.username
      FROM academicians a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.id
    `;

    console.log(`👨‍🏫 Mevcut akademisyen sayısı: ${academicians.length}\n`);

    if (academicians.length === 0) {
      console.log("❌ Veritabanında akademisyen bulunamadı!");
      console.log("📝 Lütfen önce akademisyen oluşturun.\n");
      process.exit(1);
    }

    // Her ders için akademisyen ata
    let assignedCount = 0;
    let academicianIndex = 0;

    for (const course of coursesWithoutAcademician) {
      // Akademisyenleri döngüsel olarak ata (round-robin)
      const academician = academicians[academicianIndex % academicians.length];
      
      try {
        await sql`
          UPDATE courses
          SET academician_id = ${academician.id}
          WHERE id = ${course.id}
        `;

        console.log(`✅ "${course.course_name}" (${course.course_code || 'Kod yok'}) → ${academician.first_name} ${academician.last_name} (${academician.username})`);
        assignedCount++;
        academicianIndex++;
      } catch (error) {
        console.error(`❌ Hata: "${course.course_name}" dersine akademisyen atanamadı:`, error.message);
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`   ✅ ${assignedCount} derse akademisyen atandı`);
    console.log(`   📝 Toplam ders: ${coursesWithoutAcademician.length}\n`);

    // Güncellenmiş durumu göster
    const remaining = await sql`
      SELECT COUNT(*) as count
      FROM courses
      WHERE academician_id IS NULL
    `;

    if (remaining[0].count > 0) {
      console.log(`⚠️  Hala ${remaining[0].count} dersin akademisyeni yok.\n`);
    } else {
      console.log("✅ Tüm derslerin akademisyeni atandı!\n");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

assignAcademicians();





