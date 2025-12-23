const sql = require("../config/db");
require("dotenv").config();

async function addCourseDates() {
  try {
    console.log("📅 Derslere tarih bilgileri ekleniyor...\n");

    // Tarihi olmayan dersleri al
    const courses = await sql`
      SELECT id, course_name, application_deadline, start_date, end_date 
      FROM courses 
      ORDER BY id
    `;
    
    console.log(`📚 ${courses.length} ders kontrol ediliyor\n`);

    let updatedCount = 0;
    
    // Yaz okulu için standart tarihler
    const applicationDeadline = '2026-06-30'; // 30 Haziran 2026
    const startDate = '2026-07-01';            // 1 Temmuz 2026
    const endDate = '2026-08-31';              // 31 Ağustos 2026

    for (const course of courses) {
      // Eğer tarihler eksikse güncelle
      const needsUpdate = !course.application_deadline || !course.start_date || !course.end_date;
      
      if (needsUpdate) {
        try {
          await sql`
            UPDATE courses
            SET 
              application_deadline = COALESCE(application_deadline, ${applicationDeadline}),
              start_date = COALESCE(start_date, ${startDate}),
              end_date = COALESCE(end_date, ${endDate})
            WHERE id = ${course.id}
          `;
          
          console.log(`✅ ${course.course_name}`);
          console.log(`   📝 Başvuru Son: ${applicationDeadline}`);
          console.log(`   🎯 Başlangıç: ${startDate}`);
          console.log(`   🏁 Bitiş: ${endDate}\n`);
          updatedCount++;
        } catch (error) {
          console.log(`❌ ${course.course_name} güncellenemedi: ${error.message}`);
        }
      } else {
        console.log(`⏭️  ${course.course_name} - Tarihler mevcut, atlanıyor`);
      }
    }

    console.log("=".repeat(70));
    console.log(`📊 Özet:`);
    console.log(`   ✅ Güncellenen: ${updatedCount}`);
    console.log(`   ⏭️  Zaten mevcut: ${courses.length - updatedCount}`);
    console.log(`   📝 Toplam: ${courses.length}`);
    console.log("=".repeat(70));

    console.log("\n📅 Eklenen Tarihler:");
    console.log(`   📝 Başvuru Son Tarihi: 30 Haziran 2026`);
    console.log(`   🎯 Ders Başlangıç: 1 Temmuz 2026`);
    console.log(`   🏁 Ders Bitiş: 31 Ağustos 2026`);

    console.log("\n✨ Tarih bilgileri başarıyla eklendi!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

addCourseDates();






