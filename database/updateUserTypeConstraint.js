// Users tablosunun user_type constraint'ini güncelleme script'i
// Kullanım: node backend/database/updateUserTypeConstraint.js

require("dotenv").config();
const sql = require("../config/db");

async function updateConstraint() {
  console.log("🔄 User type constraint güncelleniyor...\n");

  try {
    // Eski constraint'i sil
    console.log("📝 Eski constraint siliniyor...");
    await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check`;
    console.log("✅ Eski constraint silindi\n");

    // Yeni constraint ekle (admin dahil)
    console.log("📝 Yeni constraint ekleniyor...");
    await sql`
      ALTER TABLE users 
      ADD CONSTRAINT users_user_type_check 
      CHECK (user_type IN ('student', 'academician', 'admin'))
    `;
    console.log("✅ Yeni constraint eklendi\n");

    console.log("🎉 Constraint başarıyla güncellendi!");
    console.log("💡 Artık admin kullanıcıları oluşturabilirsiniz!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Hata oluştu:", error.message);
    console.error("\n🔍 Detaylar:", error);
    process.exit(1);
  }
}

// Script'i çalıştır
updateConstraint();


