// Yaz okulu başvuru tarihlerini güncelleme script'i
// Bu script courses tablosuna application_deadline sütunu ekler ve tarihleri günceller

require("dotenv").config();
const sql = require("../config/db");

async function updateApplicationDeadlines() {
  console.log("🔧 Yaz okulu başvuru tarihleri güncelleniyor...\n");

  try {
    // 1. application_deadline sütununu ekle (eğer yoksa)
    console.log("📝 Courses tablosuna application_deadline sütunu ekleniyor...");
    await sql`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS application_deadline DATE
    `;
    console.log("✅ application_deadline sütunu eklendi\n");

    // 2. start_date sütununu ekle (eğer yoksa)
    console.log("📝 Courses tablosuna start_date sütunu ekleniyor...");
    await sql`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS start_date DATE
    `;
    console.log("✅ start_date sütunu eklendi\n");

    // 3. end_date sütununu ekle (eğer yoksa)
    console.log("📝 Courses tablosuna end_date sütunu ekleniyor...");
    await sql`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS end_date DATE
    `;
    console.log("✅ end_date sütunu eklendi\n");

    // 4. Mevcut tüm derslerin başvuru tarihlerini 2026'ya güncelle
    console.log("📅 Başvuru tarihleri 2026 yılına güncelleniyor...");
    
    const updateResult = await sql`
      UPDATE courses 
      SET 
        application_deadline = '2026-06-30',
        start_date = '2026-07-01',
        end_date = '2026-08-31'
      WHERE application_deadline IS NULL OR application_deadline < CURRENT_DATE
    `;
    
    console.log(`✅ ${updateResult.count} ders kaydı güncellendi\n`);

    // 5. Tüm dersleri kontrol et
    console.log("🔍 Güncellenmiş dersler kontrol ediliyor...");
    const courses = await sql`
      SELECT 
        id, 
        course_name, 
        application_deadline, 
        start_date, 
        end_date 
      FROM courses 
      ORDER BY id
      LIMIT 10
    `;

    if (courses.length > 0) {
      console.log("\n📋 İlk 10 ders kaydı:");
      console.table(courses.map(c => ({
        ID: c.id,
        'Ders Adı': c.course_name,
        'Başvuru Son': c.application_deadline?.toISOString().split('T')[0] || 'YOK',
        'Başlangıç': c.start_date?.toISOString().split('T')[0] || 'YOK',
        'Bitiş': c.end_date?.toISOString().split('T')[0] || 'YOK'
      })));
    } else {
      console.log("⚠️  Veritabanında henüz ders kaydı yok.");
    }

    console.log("\n✅ Başvuru tarihleri başarıyla güncellendi!");
    console.log("📌 Yeni başvuru son tarihi: 30 Haziran 2026");
    console.log("📌 Yaz okulu dönemi: 1 Temmuz - 31 Ağustos 2026");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

// Script'i çalıştır
updateApplicationDeadlines();



