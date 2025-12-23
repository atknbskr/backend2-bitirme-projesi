const sql = require("../config/db");

async function addUniversityType() {
  try {
    console.log("Üniversiteler tablosuna type sütunu ekleniyor...");

    // Type sütununu ekle (eğer yoksa)
    await sql`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'devlet'
    `;

    console.log("Type sütunu başarıyla eklendi!");

    // Mevcut üniversiteleri güncelle
    console.log("Mevcut üniversitelerin tipleri güncelleniyor...");

    // Vakıf üniversiteleri
    await sql`
      UPDATE universities 
      SET type = 'vakif' 
      WHERE name IN ('Sabancı Üniversitesi', 'Koç Üniversitesi')
    `;

    // Özel üniversiteler
    await sql`
      UPDATE universities 
      SET type = 'ozel' 
      WHERE name IN ('Hasan Kalyoncu Üniversitesi')
    `;

    // Diğerleri devlet olarak kalacak (varsayılan)
    
    console.log("Üniversite tipleri başarıyla güncellendi!");
    
    // Güncellenmiş üniversiteleri göster
    const universities = await sql`SELECT id, name, type FROM universities ORDER BY name`;
    console.log("\nGüncellenmiş üniversiteler:");
    console.table(universities);

    process.exit(0);
  } catch (error) {
    console.error("Hata:", error);
    process.exit(1);
  }
}

addUniversityType();









