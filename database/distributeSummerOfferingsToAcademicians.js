// summer_school_offerings tablosundaki dersleri akademisyenlere eşit dağıtma script'i
// Kullanım: node backend/database/distributeSummerOfferingsToAcademicians.js

require("dotenv").config();
const path = require("path");
const sql = require(path.join(__dirname, "../config/db"));

async function distributeOfferings() {
  console.log("🔍 Yaz okulu dersleri akademisyenlere dağıtılıyor...\n");

  try {
    // Tüm akademisyenleri al
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

    // Akademisyenleri listele
    console.log("📋 Akademisyenler:");
    academicians.forEach((acad, index) => {
      console.log(`   ${index + 1}. ${acad.first_name} ${acad.last_name} (ID: ${acad.id}, Username: ${acad.username})`);
    });
    console.log("");

    // Tüm yaz okulu tekliflerini al
    const offerings = await sql`
      SELECT id, course_name, course_code, academician_id
      FROM summer_school_offerings
      ORDER BY id
    `;

    console.log(`📚 Toplam yaz okulu dersi sayısı: ${offerings.length}\n`);

    if (offerings.length === 0) {
      console.log("⚠️  Yaz okulu dersi bulunamadı!\n");
      process.exit(0);
    }

    // Mevcut dağılımı göster
    const currentDistribution = await sql`
      SELECT 
        academician_id,
        COUNT(*) as count
      FROM summer_school_offerings
      WHERE academician_id IS NOT NULL
      GROUP BY academician_id
      ORDER BY academician_id
    `;

    console.log("📊 Mevcut dağılım:");
    if (currentDistribution.length > 0) {
      for (const dist of currentDistribution) {
        const acad = academicians.find(a => a.id === dist.academician_id);
        const name = acad ? `${acad.first_name} ${acad.last_name}` : `ID: ${dist.academician_id}`;
        console.log(`   ${name}: ${dist.count} ders`);
      }
    } else {
      console.log("   Henüz ders atanmamış");
    }
    console.log("");

    // Akademisyeni olmayan dersleri bul
    const offeringsWithoutAcademician = await sql`
      SELECT id, course_name, course_code
      FROM summer_school_offerings
      WHERE academician_id IS NULL
      ORDER BY id
    `;

    console.log(`📝 Akademisyeni olmayan ders sayısı: ${offeringsWithoutAcademician.length}\n`);

    // Tüm dersleri yeniden dağıt (eşit dağılım için)
    let academicianIndex = 0;
    let assignedCount = 0;
    let reassignedCount = 0;

    // Önce tüm derslerin academician_id'sini NULL yap (yeniden dağıtım için)
    console.log("🔄 Dersler yeniden dağıtılıyor...\n");
    
    for (const offering of offerings) {
      // Akademisyenleri döngüsel olarak ata (round-robin)
      const academician = academicians[academicianIndex % academicians.length];
      
      try {
        await sql`
          UPDATE summer_school_offerings
          SET academician_id = ${academician.id}
          WHERE id = ${offering.id}
        `;

        const wasNull = offering.academician_id === null;
        const wasDifferent = offering.academician_id !== academician.id;
        
        if (wasNull) {
          console.log(`✅ "${offering.course_name}" (${offering.course_code || 'Kod yok'}) → ${academician.first_name} ${academician.last_name}`);
          assignedCount++;
        } else if (wasDifferent) {
          console.log(`🔄 "${offering.course_name}" (${offering.course_code || 'Kod yok'}) → ${academician.first_name} ${academician.last_name} (yeniden atandı)`);
          reassignedCount++;
        }
        
        academicianIndex++;
      } catch (error) {
        console.error(`❌ Hata: "${offering.course_name}" dersine akademisyen atanamadı:`, error.message);
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`   ✅ ${assignedCount} yeni ders atandı`);
    console.log(`   🔄 ${reassignedCount} ders yeniden atandı`);
    console.log(`   📝 Toplam işlem: ${offerings.length}\n`);

    // Güncellenmiş dağılımı göster
    const newDistribution = await sql`
      SELECT 
        academician_id,
        COUNT(*) as count
      FROM summer_school_offerings
      WHERE academician_id IS NOT NULL
      GROUP BY academician_id
      ORDER BY academician_id
    `;

    console.log("📊 Yeni dağılım:");
    for (const dist of newDistribution) {
      const acad = academicians.find(a => a.id === dist.academician_id);
      if (acad) {
        const percentage = ((dist.count / offerings.length) * 100).toFixed(1);
        console.log(`   ${acad.first_name} ${acad.last_name}: ${dist.count} ders (${percentage}%)`);
      }
    }
    console.log("");

    // Eşit dağılım kontrolü
    const counts = newDistribution.map(d => d.count);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const difference = max - min;

    if (difference <= 1) {
      console.log("✅ Dersler eşit dağıtıldı! (Fark: " + difference + " ders)\n");
    } else {
      console.log(`⚠️  Dersler eşit dağıtıldı (Fark: ${difference} ders - bu normal olabilir)\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

distributeOfferings();

