/**
 * Gaziantep Yaz Okulu Verilerini Ekleyen Script
 * 
 * Kullanım:
 * node database/seedGaziantepData.js
 * 
 * NOT: .env dosyanızda DATABASE_URL tanımlı olmalı
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedGaziantepData() {
  console.log('🚀 Gaziantep yaz okulu verileri ekleniyor...\n');

  try {
    // 1. Gaziantep Üniversitelerini Ekle
    console.log('📚 Gaziantep üniversiteleri kontrol ediliyor...');
    
    // Gaziantep Üniversitesi
    let gantepExists = await sql`SELECT id FROM universities WHERE name = 'Gaziantep Üniversitesi'`;
    if (gantepExists.length === 0) {
      await sql`
        INSERT INTO universities (name, city, type, website, description) VALUES
        ('Gaziantep Üniversitesi', 'Gaziantep', 'devlet', 'https://www.gantep.edu.tr', 'Gaziantep''in köklü devlet üniversitesi')
      `;
      console.log('✅ Gaziantep Üniversitesi eklendi');
    }

    // GİBTÜ
    let gibtuExists = await sql`SELECT id FROM universities WHERE name = 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi'`;
    if (gibtuExists.length === 0) {
      await sql`
        INSERT INTO universities (name, city, type, website, description) VALUES
        ('Gaziantep İslam Bilim ve Teknoloji Üniversitesi', 'Gaziantep', 'devlet', 'https://www.gibtu.edu.tr', 'İslam bilim ve teknoloji odaklı devlet üniversitesi')
      `;
      console.log('✅ GİBTÜ eklendi');
    }

    // Hasan Kalyoncu Üniversitesi'ni güncelle
    let hkuExists = await sql`SELECT id FROM universities WHERE name = 'Hasan Kalyoncu Üniversitesi'`;
    if (hkuExists.length > 0) {
      await sql`
        UPDATE universities 
        SET city = 'Gaziantep', 
            type = 'vakıf',
            website = 'https://www.hku.edu.tr',
            description = 'Gaziantep''te bulunan vakıf üniversitesi'
        WHERE name = 'Hasan Kalyoncu Üniversitesi'
      `;
      console.log('✅ Hasan Kalyoncu Üniversitesi güncellendi');
    }
    
    console.log();

    // 2. Üniversite ID'lerini Al
    const hku = await sql`SELECT id FROM universities WHERE name = 'Hasan Kalyoncu Üniversitesi'`;
    const gantep = await sql`SELECT id FROM universities WHERE name = 'Gaziantep Üniversitesi'`;
    const gibtu = await sql`SELECT id FROM universities WHERE name = 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi'`;

    const hku_id = hku[0]?.id;
    const gantep_id = gantep[0]?.id;
    const gibtu_id = gibtu[0]?.id;

    if (!hku_id || !gantep_id || !gibtu_id) {
      throw new Error('Üniversiteler bulunamadı!');
    }

    console.log(`📌 HKU ID: ${hku_id}`);
    console.log(`📌 Gaziantep Üni ID: ${gantep_id}`);
    console.log(`📌 GİBTÜ ID: ${gibtu_id}\n`);

    // 3. İlk Akademisyeni Al (varsa)
    const academicians = await sql`SELECT id FROM academicians LIMIT 1`;
    const academician_id = academicians[0]?.id || null;

    if (academician_id) {
      console.log(`👨‍🏫 Akademisyen ID: ${academician_id} kullanılacak\n`);
    } else {
      console.log('⚠️  Akademisyen bulunamadı, NULL kullanılacak\n');
    }

    // 4. Yaz Okulu Derslerini Ekle
    console.log('📝 Yaz okulu dersleri ekleniyor...');

    const courses = [
      // Matematik Dersleri
      { uni: hku_id, name: 'Matematik I', code: 'MAT101', desc: 'Temel matematik kavramları, limit, türev ve integral.', hours: 56, credits: 4, price: 500, quota: 40 },
      { uni: gantep_id, name: 'Matematik I', code: 'MAT101', desc: 'Fonksiyonlar, limit, süreklilik, türev.', hours: 56, credits: 4, price: 450, quota: 50 },
      { uni: gibtu_id, name: 'Matematik I', code: 'MAT101', desc: 'Temel analiz, türev ve integral hesabı.', hours: 56, credits: 4, price: 480, quota: 35 },
      { uni: hku_id, name: 'Matematik II', code: 'MAT102', desc: 'Çok değişkenli fonksiyonlar, çift ve üçlü integraller.', hours: 56, credits: 4, price: 500, quota: 35 },
      { uni: gantep_id, name: 'Matematik II', code: 'MAT102', desc: 'İntegral uygulamaları, seri ve dizi.', hours: 56, credits: 4, price: 450, quota: 40 },
      { uni: hku_id, name: 'Diferansiyel Denklemler', code: 'MAT201', desc: 'Birinci ve ikinci mertebe diferansiyel denklemler.', hours: 42, credits: 3, price: 550, quota: 30 },
      { uni: gantep_id, name: 'Diferansiyel Denklemler', code: 'MAT203', desc: 'ODE ve PDE çözüm teknikleri.', hours: 42, credits: 3, price: 520, quota: 35 },
      { uni: hku_id, name: 'Lineer Cebir', code: 'MAT203', desc: 'Matrisler, determinantlar, vektör uzayları.', hours: 42, credits: 3, price: 550, quota: 40 },

      // Fizik Dersleri
      { uni: hku_id, name: 'Fizik I', code: 'FIZ101', desc: 'Mekanik, hareket, kuvvet, enerji.', hours: 56, credits: 4, price: 450, quota: 45 },
      { uni: gantep_id, name: 'Fizik I', code: 'FIZ101', desc: 'Klasik mekanik, Newton yasaları.', hours: 56, credits: 4, price: 420, quota: 50 },
      { uni: hku_id, name: 'Fizik II', code: 'FIZ102', desc: 'Elektrik, manyetizma, optik.', hours: 56, credits: 4, price: 450, quota: 40 },
      { uni: gantep_id, name: 'Fizik II', code: 'FIZ102', desc: 'Elektromanyetik, dalgalar ve modern fizik.', hours: 56, credits: 4, price: 420, quota: 45 },

      // Kimya
      { uni: hku_id, name: 'Genel Kimya', code: 'KIM101', desc: 'Atomik yapı, kimyasal bağlar, tepkimeler.', hours: 56, credits: 4, price: 480, quota: 35 },
      { uni: gantep_id, name: 'Genel Kimya', code: 'KIM101', desc: 'Temel kimya kavramları, periyodik tablo.', hours: 56, credits: 4, price: 450, quota: 40 },

      // Bilgisayar Mühendisliği
      { uni: hku_id, name: 'Veri Yapıları ve Algoritmalar', code: 'CSE102', desc: 'Temel veri yapıları, sıralama ve arama.', hours: 56, credits: 4, price: 600, quota: 30 },
      { uni: gantep_id, name: 'Veri Yapıları', code: 'BIL212', desc: 'Liste, yığın, kuyruk, ağaç ve graf.', hours: 56, credits: 4, price: 580, quota: 35 },
      { uni: hku_id, name: 'Algoritmalar', code: 'CSE201', desc: 'İleri algoritma tasarımı, dinamik programlama.', hours: 42, credits: 3, price: 600, quota: 25 },
      { uni: hku_id, name: 'Nesneye Yönelik Programlama', code: 'CSE202', desc: 'OOP kavramları, Java programlama.', hours: 56, credits: 4, price: 600, quota: 35 },
      { uni: gantep_id, name: 'Nesneye Yönelik Programlama', code: 'BIL202', desc: 'Java ile OOP, tasarım kalıpları.', hours: 56, credits: 4, price: 580, quota: 40 },
      { uni: hku_id, name: 'Veritabanı Sistemleri', code: 'CSE301', desc: 'İlişkisel veritabanı, SQL, normalizasyon.', hours: 42, credits: 3, price: 650, quota: 30 },
      { uni: gantep_id, name: 'Veritabanı Yönetim Sistemleri', code: 'BIL312', desc: 'SQL, PostgreSQL ve MySQL.', hours: 42, credits: 3, price: 620, quota: 35 },

      // Zorunlu Dersler
      { uni: hku_id, name: 'İngilizce I', code: 'ING101', desc: 'Temel İngilizce gramer, okuma ve yazma.', hours: 42, credits: 3, price: 400, quota: 50 },
      { uni: gantep_id, name: 'İngilizce I', code: 'YDI101', desc: 'Temel İngilizce dil becerileri.', hours: 42, credits: 3, price: 380, quota: 60 },
      { uni: gibtu_id, name: 'İngilizce I', code: 'ENG101', desc: 'Akademik İngilizce, okuma ve yazma.', hours: 42, credits: 3, price: 400, quota: 45 },
      { uni: hku_id, name: 'İngilizce II', code: 'ING102', desc: 'İleri seviye İngilizce, akademik yazma.', hours: 42, credits: 3, price: 400, quota: 45 },
      { uni: gantep_id, name: 'İngilizce II', code: 'YDI102', desc: 'İleri gramer, akademik okuma.', hours: 42, credits: 3, price: 380, quota: 50 },
      { uni: hku_id, name: 'Türk Dili I', code: 'TDL101', desc: 'Türk dilinin yapısı, yazılı anlatım.', hours: 28, credits: 2, price: 300, quota: 60 },
      { uni: gantep_id, name: 'Türk Dili', code: 'TDL101', desc: 'Türkçe dil bilgisi, kompozisyon.', hours: 28, credits: 2, price: 280, quota: 70 },
      { uni: hku_id, name: 'Atatürk İlkeleri ve İnkılap Tarihi I', code: 'ATA101', desc: 'Türk İnkılap Tarihi, Atatürk ilkeleri.', hours: 28, credits: 2, price: 300, quota: 60 },
      { uni: gantep_id, name: 'Atatürk İlkeleri ve İnkılap Tarihi', code: 'AIT101', desc: 'Türk İnkılabı, Atatürk dönemi.', hours: 28, credits: 2, price: 280, quota: 70 },

      // İşletme/İktisat
      { uni: hku_id, name: 'Genel Muhasebe', code: 'ISL101', desc: 'Temel muhasebe kavramları, mali tablolar.', hours: 42, credits: 3, price: 500, quota: 40 },
      { uni: gantep_id, name: 'Genel Muhasebe I', code: 'MUH101', desc: 'Muhasebe döngüsü, hesap planı.', hours: 42, credits: 3, price: 480, quota: 45 },
      { uni: hku_id, name: 'Mikroekonomi', code: 'EKO101', desc: 'Arz-talep analizi, piyasa yapıları.', hours: 42, credits: 3, price: 500, quota: 35 },
      { uni: gantep_id, name: 'Mikroiktisat', code: 'IKT101', desc: 'Tüketici davranışı, firma teorisi.', hours: 42, credits: 3, price: 480, quota: 40 },
      { uni: hku_id, name: 'Makroekonomi', code: 'EKO102', desc: 'Milli gelir, enflasyon, işsizlik.', hours: 42, credits: 3, price: 500, quota: 35 },
      { uni: gantep_id, name: 'Makroiktisat', code: 'IKT102', desc: 'Ekonomik büyüme, para teorisi.', hours: 42, credits: 3, price: 480, quota: 40 },
    ];

    let insertedCount = 0;
    for (const course of courses) {
      try {
        await sql`
          INSERT INTO summer_school_offerings (
            university_id, academician_id, course_name, course_code, description,
            course_hours, credits, start_date, end_date, application_start_date,
            application_deadline, price, quota, is_active
          ) VALUES (
            ${course.uni}, ${academician_id}, ${course.name}, ${course.code}, ${course.desc},
            ${course.hours}, ${course.credits}, '2025-07-15', '2025-08-15', '2025-06-01',
            '2025-07-10', ${course.price}, ${course.quota}, true
          )
        `;
        insertedCount++;
      } catch (error) {
        console.log(`⚠️  ${course.name} (${course.code}) eklenemedi: ${error.message}`);
      }
    }

    console.log(`✅ ${insertedCount} yaz okulu dersi eklendi\n`);

    // 5. Özet
    const totalOfferings = await sql`SELECT COUNT(*) as count FROM summer_school_offerings`;
    const totalUniversities = await sql`SELECT COUNT(*) as count FROM universities WHERE city = 'Gaziantep'`;

    console.log('📊 ÖZET:');
    console.log(`   Gaziantep Üniversiteleri: ${totalUniversities[0].count}`);
    console.log(`   Toplam Yaz Okulu Dersi: ${totalOfferings[0].count}`);
    console.log('\n✨ Gaziantep yaz okulu verileri başarıyla eklendi!');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

// Script'i çalıştır
seedGaziantepData()
  .then(() => {
    console.log('\n🎉 İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 İşlem başarısız:', error);
    process.exit(1);
  });

