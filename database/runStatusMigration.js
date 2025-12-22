const sql = require("../config/db");
const fs = require("fs");
const path = require("path");

async function runStatusMigration() {
  try {
    console.log("🔄 Favorites tablosuna status alanı ekleniyor...\n");

    // SQL dosyasını oku
    const sqlFile = path.join(__dirname, "addStatusToFavorites.sql");
    const sqlContent = fs.readFileSync(sqlFile, "utf8");

    // SQL komutlarını çalıştır (her satırı ayrı ayrı)
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--") && !s.startsWith("SELECT"));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql(statement);
          console.log(`✅ Çalıştırıldı: ${statement.substring(0, 50)}...`);
        } catch (error) {
          // Eğer kolon zaten varsa hata verme (IF NOT EXISTS gibi)
          if (error.message.includes("already exists") || error.message.includes("duplicate")) {
            console.log(`⚠️  Zaten mevcut: ${statement.substring(0, 50)}...`);
          } else {
            throw error;
          }
        }
      }
    }

    // Son kontrol
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'favorites' AND column_name = 'status'
    `;

    if (result.length > 0) {
      console.log("\n✅ Migration başarıyla tamamlandı!");
      console.log(`📊 Status kolonu: ${result[0].data_type} (Varsayılan: ${result[0].column_default})`);
    } else {
      console.log("\n⚠️  Status kolonu bulunamadı, lütfen manuel olarak kontrol edin.");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration hatası:", error.message);
    console.error(error);
    process.exit(1);
  }
}

runStatusMigration();


