const sql = require("../config/db");

async function addSampleCourses() {
  try {
    console.log("📚 Örnek dersler ekleniyor...\n");

    // Önce akademisyen ve üniversite var mı kontrol et
    const academicians = await sql`SELECT id, university_id FROM academicians LIMIT 1`;
    const universities = await sql`SELECT id FROM universities LIMIT 1`;

    let academicianId = null;
    let universityId = null;

    if (academicians.length > 0) {
      academicianId = academicians[0].id;
      universityId = academicians[0].university_id;
      console.log(`✅ Akademisyen bulundu (ID: ${academicianId})`);
    }

    if (universities.length > 0 && !universityId) {
      universityId = universities[0].id;
      console.log(`✅ Üniversite bulundu (ID: ${universityId})`);
    }

    // Örnek dersler
    const sampleCourses = [
      {
        course_name: "Veri Yapıları ve Algoritmalar",
        course_code: "BLM201",
        description: "Temel veri yapıları, algoritma analizi ve tasarımı",
        category: "Zorunlu",
      },
      {
        course_name: "Veritabanı Yönetim Sistemleri",
        course_code: "BLM301",
        description: "İlişkisel veritabanları, SQL, veritabanı tasarımı",
        category: "Zorunlu",
      },
      {
        course_name: "Web Programlama",
        course_code: "BLM302",
        description: "HTML, CSS, JavaScript, React, Node.js",
        category: "Seçmeli",
      },
      {
        course_name: "Nesne Yönelimli Programlama",
        course_code: "BLM202",
        description: "OOP prensipleri, Java, C++",
        category: "Zorunlu",
      },
      {
        course_name: "İşletim Sistemleri",
        course_code: "BLM303",
        description: "İşletim sistemi temelleri, süreç yönetimi, bellek yönetimi",
        category: "Zorunlu",
      },
      {
        course_name: "Bilgisayar Ağları",
        course_code: "BLM304",
        description: "Ağ protokolleri, TCP/IP, OSI modeli",
        category: "Zorunlu",
      },
      {
        course_name: "Yapay Zeka",
        course_code: "BLM401",
        description: "Makine öğrenmesi, derin öğrenme, sinir ağları",
        category: "Seçmeli",
      },
      {
        course_name: "Mobil Uygulama Geliştirme",
        course_code: "BLM402",
        description: "Android, iOS, React Native",
        category: "Seçmeli",
      },
      {
        course_name: "Yazılım Mühendisliği",
        course_code: "BLM305",
        description: "Yazılım geliştirme süreçleri, proje yönetimi",
        category: "Zorunlu",
      },
      {
        course_name: "Bilgisayar Grafikler",
        course_code: "BLM403",
        description: "2D/3D grafik programlama, OpenGL",
        category: "Seçmeli",
      },
      {
        course_name: "Mikroişlemciler",
        course_code: "BLM203",
        description: "Mikroişlemci mimarisi, assembly programlama",
        category: "Zorunlu",
      },
      {
        course_name: "Sayısal Mantık Tasarımı",
        course_code: "BLM102",
        description: "Sayısal devreler, lojik kapılar, boolean cebir",
        category: "Zorunlu",
      },
      {
        course_name: "Diferansiyel Denklemler",
        course_code: "MAT201",
        description: "Birinci ve ikinci mertebeden diferansiyel denklemler",
        category: "Zorunlu",
      },
      {
        course_name: "Olasılık ve İstatistik",
        course_code: "MAT202",
        description: "Olasılık teorisi, istatistiksel analiz",
        category: "Zorunlu",
      },
      {
        course_name: "Ayrık Matematik",
        course_code: "MAT101",
        description: "Kümeler, graflar, kombinatorik",
        category: "Zorunlu",
      },
    ];

    console.log(`\n📝 ${sampleCourses.length} ders ekleniyor...\n`);

    for (const course of sampleCourses) {
      try {
        // Önce aynı ders kodundan var mı kontrol et
        const existing = await sql`
          SELECT id FROM courses WHERE course_code = ${course.course_code}
        `;

        if (existing.length > 0) {
          console.log(`⏭️  ${course.course_name} (${course.course_code}) - zaten mevcut`);
          continue;
        }

        const result = await sql`
          INSERT INTO courses (
            academician_id, 
            university_id, 
            course_name, 
            course_code, 
            description, 
            category,
            university_count,
            student_count
          )
          VALUES (
            ${academicianId}, 
            ${universityId}, 
            ${course.course_name}, 
            ${course.course_code}, 
            ${course.description}, 
            ${course.category},
            ${universityId ? 1 : 0},
            0
          )
          RETURNING id
        `;

        if (result.length > 0) {
          console.log(`✅ ${course.course_name} (${course.course_code})`);
        }
      } catch (error) {
        console.log(`❌ ${course.course_name} eklenemedi: ${error.message}`);
      }
    }

    // Toplam ders sayısını kontrol et
    const totalCourses = await sql`SELECT COUNT(*) as count FROM courses`;
    console.log(`\n🎉 Toplam ${totalCourses[0].count} ders veritabanında!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error);
    process.exit(1);
  }
}

addSampleCourses();

