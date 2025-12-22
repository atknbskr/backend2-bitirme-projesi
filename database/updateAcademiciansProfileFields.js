const sql = require('../config/db');

async function updateAcademiciansTable() {
  try {
    console.log('Akademisyenler tablosuna profil alanları ekleniyor...');

    // Akademisyenler tablosuna ek alanlar ekle
    await sql`
      ALTER TABLE academicians 
      ADD COLUMN IF NOT EXISTS title VARCHAR(50),
      ADD COLUMN IF NOT EXISTS department VARCHAR(200),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS office VARCHAR(100),
      ADD COLUMN IF NOT EXISTS university_id INTEGER REFERENCES universities(id)
    `;

    console.log('✅ Akademisyenler tablosu başarıyla güncellendi!');
    console.log('Eklenen sütunlar:');
    console.log('- title (Unvan)');
    console.log('- department (Bölüm)');
    console.log('- phone (Telefon)');
    console.log('- office (Ofis)');
    console.log('- university_id (Üniversite ID)');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.message.includes('already exists')) {
      console.log('⚠️  Sütunlar zaten mevcut, güncelleme atlandı.');
    }
  } finally {
    process.exit();
  }
}

updateAcademiciansTable();

