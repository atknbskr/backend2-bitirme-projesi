const sql = require("../config/db");

async function fixUniversitiesTable() {
  try {
    console.log("Üniversiteler tablosu kontrol ediliyor...");

    // Önce hangi sütunların olduğunu kontrol et
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'universities'
    `;
    
    console.log("Mevcut sütunlar:");
    columns.forEach(col => console.log(`  - ${col.column_name}`));

    // Type sütununu ekle (eğer yoksa)
    console.log("\n'type' sütunu ekleniyor...");
    await sql`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'devlet'
    `.catch((err) => console.log("Type sütunu zaten var:", err.message));

    // Contact email sütununu ekle (eğer yoksa)
    console.log("'contact_email' sütunu ekleniyor...");
    await sql`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)
    `.catch((err) => console.log("Contact email sütunu zaten var:", err.message));

    // Contact phone sütununu ekle (eğer yoksa)
    console.log("'contact_phone' sütunu ekleniyor...");
    await sql`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20)
    `.catch((err) => console.log("Contact phone sütunu zaten var:", err.message));

    // Logo URL sütununu ekle (eğer yoksa)
    console.log("'logo_url' sütunu ekleniyor...");
    await sql`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)
    `.catch((err) => console.log("Logo URL sütunu zaten var:", err.message));

    console.log("\n✅ Tablo yapısı başarıyla güncellendi!");

    // Güncellenmiş tablo yapısını göster
    const updatedColumns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'universities'
      ORDER BY ordinal_position
    `;
    
    console.log("\nGüncellenmiş tablo yapısı:");
    console.table(updatedColumns);

    // Mevcut üniversiteleri göster
    const universities = await sql`SELECT * FROM universities`;
    console.log(`\n📊 Toplam ${universities.length} üniversite bulundu.`);
    if (universities.length > 0) {
      console.table(universities.map(u => ({
        id: u.id,
        name: u.name,
        city: u.city,
        type: u.type || 'devlet'
      })));
    }

    // Mevcut üniversitelerin tiplerini güncelle
    console.log("\nÜniversite tipleri güncelleniyor...");
    
    // Vakıf üniversiteleri
    await sql`
      UPDATE universities 
      SET type = 'vakif' 
      WHERE name IN ('Sabancı Üniversitesi', 'Koç Üniversitesi')
      AND (type IS NULL OR type = 'devlet')
    `;

    // Özel üniversiteler
    await sql`
      UPDATE universities 
      SET type = 'ozel' 
      WHERE name IN ('Hasan Kalyoncu Üniversitesi')
      AND (type IS NULL OR type = 'devlet')
    `;

    console.log("✅ Üniversite tipleri güncellendi!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

fixUniversitiesTable();

