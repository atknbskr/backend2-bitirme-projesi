const sql = require("../config/db");
require("dotenv").config();

async function updateCoursesWithSampleData() {
  try {
    console.log("🔧 Mevcut derslere örnek veriler ekleniyor...\n");

    // Tüm dersleri al
    const courses = await sql`SELECT id, course_name, category FROM courses`;
    
    console.log(`📚 ${courses.length} ders bulundu\n`);

    let updatedCount = 0;

    for (const course of courses) {
      // Kategoriye göre dinamik değerler
      let credits = 3;
      let price = 0;
      let courseHours = 42;
      let quota = 30;
      let requirements = null;
      let equivalencyInfo = null;

      // Kategori bazlı özelleştirme
      switch (course.category) {
        case 'Zorunlu':
          credits = 3;
          price = Math.floor(Math.random() * (400 - 280 + 1)) + 280; // 280-400 TL
          courseHours = 42;
          quota = Math.floor(Math.random() * (50 - 30 + 1)) + 30; // 30-50 kişi
          requirements = 'Lisans öğrencisi olmak yeterlidir.';
          equivalencyInfo = `${course.course_name} dersi ile denktir.`;
          break;
        
        case 'Seçmeli':
          credits = Math.floor(Math.random() * 2) + 2; // 2-3 kredi
          price = Math.floor(Math.random() * (550 - 420 + 1)) + 420; // 420-550 TL
          courseHours = credits * 14; // Kredi başına 14 saat
          quota = Math.floor(Math.random() * (40 - 25 + 1)) + 25; // 25-40 kişi
          requirements = 'İlgili bölüm öğrencisi olmak.';
          equivalencyInfo = 'Seçmeli ders olarak tüm bölümlerde kullanılabilir.';
          break;

        default:
          credits = 3;
          price = Math.floor(Math.random() * (500 - 350 + 1)) + 350; // 350-500 TL
          courseHours = 42;
          quota = 35;
          requirements = 'Ön koşul bulunmamaktadır.';
          equivalencyInfo = 'Üniversiteniz ile denklik onayı alınmalıdır.';
      }

      // Bazı derslere özel requirements ve equivalency ekle
      if (course.course_name.includes('İleri') || course.course_name.includes('II')) {
        requirements = `${course.course_name.replace('İleri ', '').replace(' II', ' I')} dersini başarmış olmak gereklidir.`;
      }

      if (course.course_name.includes('Matematik') || course.course_name.includes('Diferansiyel')) {
        credits = 4;
        price = Math.floor(Math.random() * (550 - 450 + 1)) + 450; // 450-550 TL
        courseHours = 56;
      }

      if (course.course_name.includes('Programlama') || course.course_name.includes('Algoritma') || course.course_name.includes('Veritabanı')) {
        credits = 4;
        price = Math.floor(Math.random() * (650 - 580 + 1)) + 580; // 580-650 TL
        courseHours = 56;
        quota = Math.floor(Math.random() * (35 - 25 + 1)) + 25; // 25-35 kişi
      }

      try {
        await sql`
          UPDATE courses
          SET 
            credits = ${credits},
            price = ${price},
            course_hours = ${courseHours},
            quota = ${quota},
            requirements = ${requirements},
            equivalency_info = ${equivalencyInfo}
          WHERE id = ${course.id}
        `;
        
        console.log(`✅ ${course.course_name} - ${credits} kredi, ₺${price}, ${courseHours} saat, ${quota} kişi`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ ${course.course_name} güncellenemedi: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log(`📊 Özet:`);
    console.log(`   ✅ Güncellenen: ${updatedCount}`);
    console.log(`   📝 Toplam: ${courses.length}`);
    console.log("=".repeat(70));

    console.log("\n✨ Örnek veriler başarıyla eklendi!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

updateCoursesWithSampleData();















