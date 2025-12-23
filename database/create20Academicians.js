const bcrypt = require("bcryptjs");
const sql = require("../config/db");
require("dotenv").config();

// 20 akademisyen verisi - Çeşitli bölümlerden
const academicians = [
  { 
    firstName: "Ayşe", 
    lastName: "Yılmaz", 
    email: "ayse.yilmaz@universite.edu.tr", 
    username: "ayilmaz",
    title: "Prof. Dr."
  },
  { 
    firstName: "Mehmet", 
    lastName: "Demir", 
    email: "mehmet.demir@universite.edu.tr", 
    username: "mdemir",
    title: "Doç. Dr."
  },
  { 
    firstName: "Zeynep", 
    lastName: "Kaya", 
    email: "zeynep.kaya@universite.edu.tr", 
    username: "zkaya",
    title: "Dr. Öğr. Üyesi"
  },
  { 
    firstName: "Ali", 
    lastName: "Şahin", 
    email: "ali.sahin@universite.edu.tr", 
    username: "asahin",
    title: "Prof. Dr."
  },
  { 
    firstName: "Fatma", 
    lastName: "Çelik", 
    email: "fatma.celik@universite.edu.tr", 
    username: "fcelik",
    title: "Doç. Dr."
  },
  { 
    firstName: "Mustafa", 
    lastName: "Aydın", 
    email: "mustafa.aydin@universite.edu.tr", 
    username: "maydin",
    title: "Dr. Öğr. Üyesi"
  },
  { 
    firstName: "Elif", 
    lastName: "Özdemir", 
    email: "elif.ozdemir@universite.edu.tr", 
    username: "eozdemir",
    title: "Prof. Dr."
  },
  { 
    firstName: "Ahmet", 
    lastName: "Arslan", 
    email: "ahmet.arslan@universite.edu.tr", 
    username: "aarslan",
    title: "Doç. Dr."
  },
  { 
    firstName: "Merve", 
    lastName: "Koç", 
    email: "merve.koc@universite.edu.tr", 
    username: "mkoc",
    title: "Dr. Öğr. Üyesi"
  },
  { 
    firstName: "Hasan", 
    lastName: "Kurt", 
    email: "hasan.kurt@universite.edu.tr", 
    username: "hkurt",
    title: "Prof. Dr."
  },
  { 
    firstName: "Hatice", 
    lastName: "Öztürk", 
    email: "hatice.ozturk@universite.edu.tr", 
    username: "hozturk",
    title: "Doç. Dr."
  },
  { 
    firstName: "İbrahim", 
    lastName: "Aksoy", 
    email: "ibrahim.aksoy@universite.edu.tr", 
    username: "iaksoy",
    title: "Dr. Öğr. Üyesi"
  },
  { 
    firstName: "Emine", 
    lastName: "Yıldız", 
    email: "emine.yildiz@universite.edu.tr", 
    username: "eyildiz",
    title: "Prof. Dr."
  },
  { 
    firstName: "Hüseyin", 
    lastName: "Yıldırım", 
    email: "huseyin.yildirim@universite.edu.tr", 
    username: "hyildirim",
    title: "Doç. Dr."
  },
  { 
    firstName: "Seda", 
    lastName: "Polat", 
    email: "seda.polat@universite.edu.tr", 
    username: "spolat",
    title: "Dr. Öğr. Üyesi"
  },
  { 
    firstName: "Yunus", 
    lastName: "Doğan", 
    email: "yunus.dogan@universite.edu.tr", 
    username: "ydogan",
    title: "Prof. Dr."
  },
  { 
    firstName: "Esra", 
    lastName: "Can", 
    email: "esra.can@universite.edu.tr", 
    username: "ecan",
    title: "Doç. Dr."
  },
  { 
    firstName: "Burak", 
    lastName: "Erdoğan", 
    email: "burak.erdogan@universite.edu.tr", 
    username: "berdogan",
    title: "Dr. Öğr. Üyesi"
  },
  { 
    firstName: "Gamze", 
    lastName: "Güneş", 
    email: "gamze.gunes@universite.edu.tr", 
    username: "ggunes",
    title: "Prof. Dr."
  },
  { 
    firstName: "Emre", 
    lastName: "Kara", 
    email: "emre.kara@universite.edu.tr", 
    username: "ekara",
    title: "Doç. Dr."
  }
];

async function create20Academicians() {
  console.log("🚀 20 Akademisyen kaydı oluşturuluyor...\n");

  try {
    // Önce bir üniversite seç (ilk üniversite)
    const universities = await sql`SELECT id, name FROM universities ORDER BY id LIMIT 1`;
    
    if (universities.length === 0) {
      console.error("❌ Veritabanında üniversite bulunamadı!");
      console.log("💡 Önce üniversite oluşturun: node database/addGaziantepUniversities.js");
      process.exit(1);
    }

    const universityId = universities[0].id;
    console.log(`📍 Akademisyenler ${universities[0].name} üniversitesine atanacak\n`);

    let successCount = 0;
    let errorCount = 0;
    const createdAcademicians = [];

    // Akademisyenleri oluştur
    for (const academician of academicians) {
      try {
        // Email kontrolü
        const existingUser = await sql`SELECT id FROM users WHERE email = ${academician.email}`;
        if (existingUser.length > 0) {
          console.log(`⚠️  ${academician.firstName} ${academician.lastName} - Email zaten kayıtlı, atlanıyor...`);
          errorCount++;
          continue;
        }

        // Kullanıcı adı kontrolü
        const existingAcademician = await sql`SELECT id FROM academicians WHERE username = ${academician.username}`;
        if (existingAcademician.length > 0) {
          console.log(`⚠️  ${academician.firstName} ${academician.lastName} - Kullanıcı adı zaten kayıtlı, atlanıyor...`);
          errorCount++;
          continue;
        }

        // Şifreyi hashle (tüm akademisyenler için varsayılan şifre: "123456")
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("123456", salt);

        // Kullanıcıyı oluştur
        const newUser = await sql`
          INSERT INTO users (email, password_hash, user_type, first_name, last_name)
          VALUES (${academician.email}, ${passwordHash}, 'academician', ${academician.firstName}, ${academician.lastName})
          RETURNING id, email, first_name, last_name
        `;

        // Akademisyen kaydı oluştur
        const newAcademician = await sql`
          INSERT INTO academicians (user_id, username, university_id, title)
          VALUES (${newUser[0].id}, ${academician.username}, ${universityId}, ${academician.title})
          RETURNING id
        `;

        createdAcademicians.push({
          id: newAcademician[0].id,
          name: `${academician.firstName} ${academician.lastName}`,
          title: academician.title
        });

        console.log(`✅ ${academician.title} ${academician.firstName} ${academician.lastName} (${academician.username}) - Başarıyla oluşturuldu`);
        successCount++;

      } catch (error) {
        console.error(`❌ ${academician.firstName} ${academician.lastName} - Hata:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log(`📊 Akademisyen Oluşturma Özeti:`);
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    console.log(`   📝 Toplam: ${academicians.length}`);
    console.log("=".repeat(70));

    // Şimdi dersleri akademisyenlere dağıt
    if (createdAcademicians.length > 0) {
      console.log("\n📚 Mevcut dersler akademisyenlere atanıyor...\n");
      await assignCoursesToAcademicians(createdAcademicians);
    }

    console.log("\n💡 Not: Tüm akademisyenlerin şifresi: 123456");

  } catch (error) {
    console.error("❌ Genel hata:", error);
    throw error;
  }
}

async function assignCoursesToAcademicians(academicians) {
  try {
    // Akademisyeni olmayan dersleri al
    const unassignedCourses = await sql`
      SELECT id, course_name, course_code 
      FROM courses 
      WHERE academician_id IS NULL
      ORDER BY id
    `;

    if (unassignedCourses.length === 0) {
      console.log("⚠️  Atanmamış ders bulunamadı.");
      
      // Tüm dersleri al
      const allCourses = await sql`SELECT id, course_name, course_code, academician_id FROM courses ORDER BY id`;
      
      if (allCourses.length === 0) {
        console.log("⚠️  Veritabanında hiç ders yok!");
        console.log("💡 Önce örnek dersler ekleyin: node backend/database/addSampleCourses.js");
        return;
      }

      console.log(`\n📝 ${allCourses.length} ders mevcut ve zaten atanmış. Dersleri yeniden dağıtmak ister misiniz?`);
      console.log("💡 Dersleri yeniden dağıtmak için tüm derslerin academician_id'sini NULL yapın.");
      return;
    }

    console.log(`📋 ${unassignedCourses.length} atanmamış ders bulundu\n`);

    let courseIndex = 0;
    let assignedCount = 0;

    // Dersleri akademisyenlere eşit şekilde dağıt (round-robin)
    for (const course of unassignedCourses) {
      const academician = academicians[courseIndex % academicians.length];
      
      try {
        await sql`
          UPDATE courses 
          SET academician_id = ${academician.id}
          WHERE id = ${course.id}
        `;

        console.log(`✅ ${course.course_name} (${course.course_code || 'Kod Yok'}) → ${academician.title} ${academician.name}`);
        assignedCount++;
        courseIndex++;

      } catch (error) {
        console.error(`❌ ${course.course_name} atanamadı:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log(`📊 Ders Atama Özeti:`);
    console.log(`   ✅ Atanan Ders: ${assignedCount}`);
    console.log(`   📝 Toplam Atanmamış Ders: ${unassignedCourses.length}`);
    console.log(`   👨‍🏫 Akademisyen Sayısı: ${academicians.length}`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("❌ Ders atama hatası:", error);
    throw error;
  }
}

// Script'i çalıştır
create20Academicians()
  .then(() => {
    console.log("\n✨ İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Kritik hata:", error);
    process.exit(1);
  });






