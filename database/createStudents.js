const bcrypt = require("bcryptjs");
const sql = require("../config/db");
require("dotenv").config();

// 20 farklı öğrenci verisi
const students = [
  { firstName: "Ahmet", lastName: "Yılmaz", email: "ahmet.yilmaz@ogrenci.edu.tr", studentNumber: "2021001001" },
  { firstName: "Ayşe", lastName: "Kaya", email: "ayse.kaya@ogrenci.edu.tr", studentNumber: "2021001002" },
  { firstName: "Mehmet", lastName: "Demir", email: "mehmet.demir@ogrenci.edu.tr", studentNumber: "2021001003" },
  { firstName: "Fatma", lastName: "Şahin", email: "fatma.sahin@ogrenci.edu.tr", studentNumber: "2021001004" },
  { firstName: "Mustafa", lastName: "Çelik", email: "mustafa.celik@ogrenci.edu.tr", studentNumber: "2021001005" },
  { firstName: "Zeynep", lastName: "Aydın", email: "zeynep.aydin@ogrenci.edu.tr", studentNumber: "2021001006" },
  { firstName: "Ali", lastName: "Özdemir", email: "ali.ozdemir@ogrenci.edu.tr", studentNumber: "2021001007" },
  { firstName: "Elif", lastName: "Arslan", email: "elif.arslan@ogrenci.edu.tr", studentNumber: "2021001008" },
  { firstName: "Hasan", lastName: "Koç", email: "hasan.koc@ogrenci.edu.tr", studentNumber: "2021001009" },
  { firstName: "Emine", lastName: "Kurt", email: "emine.kurt@ogrenci.edu.tr", studentNumber: "2021001010" },
  { firstName: "İbrahim", lastName: "Öztürk", email: "ibrahim.ozturk@ogrenci.edu.tr", studentNumber: "2021001011" },
  { firstName: "Hatice", lastName: "Aksoy", email: "hatice.aksoy@ogrenci.edu.tr", studentNumber: "2021001012" },
  { firstName: "Hüseyin", lastName: "Yıldız", email: "huseyin.yildiz@ogrenci.edu.tr", studentNumber: "2021001013" },
  { firstName: "Merve", lastName: "Yıldırım", email: "merve.yildirim@ogrenci.edu.tr", studentNumber: "2021001014" },
  { firstName: "Yunus", lastName: "Polat", email: "yunus.polat@ogrenci.edu.tr", studentNumber: "2021001015" },
  { firstName: "Seda", lastName: "Doğan", email: "seda.dogan@ogrenci.edu.tr", studentNumber: "2021001016" },
  { firstName: "Burak", lastName: "Can", email: "burak.can@ogrenci.edu.tr", studentNumber: "2021001017" },
  { firstName: "Esra", lastName: "Erdoğan", email: "esra.erdogan@ogrenci.edu.tr", studentNumber: "2021001018" },
  { firstName: "Emre", lastName: "Güneş", email: "emre.gunes@ogrenci.edu.tr", studentNumber: "2021001019" },
  { firstName: "Gamze", lastName: "Kara", email: "gamze.kara@ogrenci.edu.tr", studentNumber: "2021001020" }
];

async function createStudents() {
  console.log("🚀 Öğrenci kayıtları oluşturuluyor...\n");

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      try {
        // Email kontrolü
        const existingUser = await sql`SELECT id FROM users WHERE email = ${student.email}`;
        if (existingUser.length > 0) {
          console.log(`⚠️  ${student.firstName} ${student.lastName} - Email zaten kayıtlı, atlanıyor...`);
          errorCount++;
          continue;
        }

        // Okul numarası kontrolü
        const existingStudent = await sql`SELECT id FROM students WHERE student_number = ${student.studentNumber}`;
        if (existingStudent.length > 0) {
          console.log(`⚠️  ${student.firstName} ${student.lastName} - Okul numarası zaten kayıtlı, atlanıyor...`);
          errorCount++;
          continue;
        }

        // Şifreyi hashle (tüm öğrenciler için varsayılan şifre: "123456")
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("123456", salt);

        // Kullanıcıyı oluştur
        const newUser = await sql`
          INSERT INTO users (email, password_hash, user_type, first_name, last_name)
          VALUES (${student.email}, ${passwordHash}, 'student', ${student.firstName}, ${student.lastName})
          RETURNING id, email, first_name, last_name
        `;

        // Öğrenci kaydı oluştur
        await sql`
          INSERT INTO students (user_id, student_number)
          VALUES (${newUser[0].id}, ${student.studentNumber})
        `;

        console.log(`✅ ${student.firstName} ${student.lastName} (${student.studentNumber}) - Başarıyla oluşturuldu`);
        successCount++;

      } catch (error) {
        console.error(`❌ ${student.firstName} ${student.lastName} - Hata:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`📊 Özet:`);
    console.log(`   ✅ Başarılı: ${successCount}`);
    console.log(`   ❌ Hatalı: ${errorCount}`);
    console.log(`   📝 Toplam: ${students.length}`);
    console.log("=".repeat(60));
    console.log("\n💡 Not: Tüm öğrencilerin şifresi: 123456");

  } catch (error) {
    console.error("❌ Genel hata:", error);
  }
}

// Script'i çalıştır
createStudents()
  .then(() => {
    console.log("\n✨ İşlem tamamlandı!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Kritik hata:", error);
    process.exit(1);
  });







