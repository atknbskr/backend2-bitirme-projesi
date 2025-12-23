const sql = require("../config/db");
require("dotenv").config();

async function updateAcademiciansContactInfo() {
  try {
    console.log("📞 Akademisyenlere iletişim bilgileri ekleniyor...\n");

    // Tüm akademisyenleri al
    const academicians = await sql`
      SELECT a.id, a.title, u.first_name, u.last_name
      FROM academicians a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.id
    `;
    
    console.log(`👨‍🏫 ${academicians.length} akademisyen bulundu\n`);

    const departments = [
      'Bilgisayar Mühendisliği',
      'Yazılım Mühendisliği', 
      'Elektrik-Elektronik Mühendisliği',
      'Matematik Bölümü',
      'Fizik Bölümü',
      'Kimya Bölümü',
      'İşletme Bölümü',
      'İngilizce Hazırlık Bölümü'
    ];

    const officeBuildings = ['A', 'B', 'C', 'D', 'Mühendislik', 'Fen-Edebiyat'];
    const officeHoursOptions = [
      'Pazartesi 10:00-12:00, Çarşamba 14:00-16:00',
      'Salı 09:00-11:00, Perşembe 13:00-15:00',
      'Pazartesi 13:00-15:00, Cuma 10:00-12:00',
      'Çarşamba 10:00-12:00, Cuma 14:00-16:00',
      'Salı 14:00-16:00, Perşembe 10:00-12:00'
    ];

    let updatedCount = 0;

    for (let i = 0; i < academicians.length; i++) {
      const acad = academicians[i];
      
      // Rastgele departman ve ofis bilgileri
      const department = departments[i % departments.length];
      const building = officeBuildings[Math.floor(Math.random() * officeBuildings.length)];
      const floor = Math.floor(Math.random() * 5) + 1; // 1-5 arası kat
      const room = Math.floor(Math.random() * 50) + 100; // 100-150 arası oda
      const office = `${building} Blok ${floor}. Kat Oda:${room}`;
      const officeHours = officeHoursOptions[Math.floor(Math.random() * officeHoursOptions.length)];

      try {
        await sql`
          UPDATE academicians
          SET 
            department = ${department},
            office = ${office},
            office_hours = ${officeHours}
          WHERE id = ${acad.id}
        `;
        
        const name = `${acad.title || ''} ${acad.first_name} ${acad.last_name}`.trim();
        console.log(`✅ ${name}`);
        console.log(`   📚 ${department}`);
        console.log(`   🏢 ${office}`);
        console.log(`   🕐 ${officeHours}\n`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ ${acad.first_name} ${acad.last_name} güncellenemedi: ${error.message}`);
      }
    }

    console.log("=".repeat(70));
    console.log(`📊 Özet:`);
    console.log(`   ✅ Güncellenen: ${updatedCount}`);
    console.log(`   📝 Toplam: ${academicians.length}`);
    console.log("=".repeat(70));

    console.log("\n✨ İletişim bilgileri başarıyla eklendi!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

updateAcademiciansContactInfo();








