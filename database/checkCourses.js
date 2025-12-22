const sql = require("../config/db");

async function checkCourses() {
  try {
    console.log("📊 Veritabanındaki dersler kontrol ediliyor...\n");

    // Dersleri kontrol et
    const courses = await sql`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.university_count,
        c.student_count,
        c.created_at,
        c.academician_id,
        c.university_id,
        u.first_name || ' ' || u.last_name as academician_name
      FROM courses c
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    console.log(`✅ Toplam ${courses.length} ders bulundu\n`);

    if (courses.length > 0) {
      console.log("📝 İlk 5 ders:\n");
      courses.slice(0, 5).forEach((course, index) => {
        console.log(`${index + 1}. ${course.course_name}`);
        console.log(`   Kod: ${course.course_code || "Yok"}`);
        console.log(`   Akademisyen: ${course.academician_name || "Atanmamış"}`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Üniversite ID: ${course.university_id || "Yok"}`);
        console.log(`   Akademisyen ID: ${course.academician_id || "Yok"}`);
        console.log("");
      });
    } else {
      console.log("⚠️  Veritabanında hiç ders yok!");
      console.log("\n💡 Örnek dersler eklemek için şunu çalıştırın:");
      console.log("   node database/addSampleCourses.js");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
    process.exit(1);
  }
}

checkCourses();






