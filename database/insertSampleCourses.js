// Örnek ders kayıtları ekleme script'i
// Kullanım: node backend/database/insertSampleCourses.js

require("dotenv").config();
const sql = require("../config/db");

async function insertSampleCourses() {
  console.log("📚 Örnek dersler ekleniyor...\n");

  try {
    // Önce akademisyen var mı kontrol et
    const academicians = await sql`SELECT id FROM academicians LIMIT 1`;
    
    let academicianId = null;
    if (academicians.length > 0) {
      academicianId = academicians[0].id;
      console.log(`✅ Akademisyen bulundu: ID ${academicianId}`);
    } else {
      console.log("⚠️  Akademisyen bulunamadı, dersler akademisyen olmadan eklenecek");
    }

    // Örnek dersler
    const sampleCourses = [
      {
        name: "Matematik I - Analiz",
        code: "MAT101",
        category: "Matematik",
        description: "Temel matematik ve analiz dersi. Limit, türev, integral konularını kapsar. Yaz döneminde yoğunlaştırılmış program ile verilmektedir."
      },
      {
        name: "Genel Fizik I",
        code: "FIZ101",
        category: "Fizik",
        description: "Mekanik, hareket, kuvvet ve enerji konularını içeren temel fizik dersi. Laboratuvar uygulamaları dahildir."
      },
      {
        name: "Programlamaya Giriş",
        code: "BIL101",
        category: "Bilgisayar Programlama",
        description: "Python programlama dili ile algoritma ve programlama mantığı öğretimi. Hiç programlama bilmeyenler için uygundur."
      },
      {
        name: "Genel Kimya I",
        code: "KIM101",
        category: "Kimya",
        description: "Atomun yapısı, periyodik tablo, kimyasal bağlar ve temel kimyasal reaksiyonlar. Laboratuvar çalışmaları ile desteklenmektedir."
      },
      {
        name: "İngilizce I",
        code: "ING101",
        category: "İngilizce",
        description: "Temel İngilizce dil becerileri. Reading, writing, listening ve speaking pratiği. YDS hazırlık için uygundur."
      },
      {
        name: "İstatistik ve Olasılık",
        code: "IST201",
        category: "İstatistik",
        description: "Temel istatistik kavramları, olasılık teorisi ve veri analizi. R programı ile uygulamalı çalışmalar."
      },
      {
        name: "Lineer Cebir",
        code: "MAT201",
        category: "Matematik",
        description: "Matrisler, determinantlar, vektör uzayları ve doğrusal dönüşümler. Mühendislik ve bilim öğrencileri için temel derstir."
      },
      {
        name: "Veri Yapıları ve Algoritmalar",
        code: "BIL201",
        category: "Bilgisayar Programlama",
        description: "Stack, queue, tree, graph gibi temel veri yapıları ve sıralama algoritmaları. Java veya C++ ile uygulamalar."
      },
      {
        name: "Organik Kimya",
        code: "KIM201",
        category: "Kimya",
        description: "Organik bileşiklerin yapısı, reaksiyonları ve sentezi. Biyokimya ve tıp öğrencileri için önemlidir."
      },
      {
        name: "İleri İngilizce",
        code: "ING201",
        category: "İngilizce",
        description: "İleri seviye İngilizce konuşma ve yazma becerileri. Academic writing ve presentation skills dahil."
      }
    ];

    console.log(`\n📝 ${sampleCourses.length} ders ekleniyor...\n`);

    let successCount = 0;
    for (const course of sampleCourses) {
      try {
        const result = await sql`
          INSERT INTO courses (
            academician_id, 
            course_name, 
            course_code, 
            category, 
            description,
            application_deadline,
            start_date,
            end_date
          )
          VALUES (
            ${academicianId},
            ${course.name},
            ${course.code},
            ${course.category},
            ${course.description},
            '2026-06-30',
            '2026-07-01',
            '2026-08-31'
          )
          RETURNING id, course_name
        `;
        
        console.log(`✅ ${result[0].course_name} (ID: ${result[0].id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${course.name} eklenirken hata:`, error.message);
      }
    }

    console.log(`\n🎉 ${successCount} ders başarıyla eklendi!`);
    
    // Eklenen dersleri göster
    const allCourses = await sql`
      SELECT 
        id, 
        course_name, 
        course_code, 
        category,
        application_deadline
      FROM courses 
      ORDER BY id DESC 
      LIMIT 10
    `;

    if (allCourses.length > 0) {
      console.log("\n📋 Veritabanındaki dersler:");
      console.table(allCourses.map(c => ({
        ID: c.id,
        'Ders Adı': c.course_name,
        'Kod': c.course_code,
        'Kategori': c.category,
        'Başvuru Son': c.application_deadline?.toISOString().split('T')[0]
      })));
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
insertSampleCourses();

