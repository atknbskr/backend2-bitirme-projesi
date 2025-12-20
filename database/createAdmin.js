// İlk admin kullanıcısını oluşturma script'i
// Kullanım: node backend/database/createAdmin.js

require("dotenv").config();
const bcrypt = require("bcryptjs");
const sql = require("../config/db");

async function createAdmin() {
  console.log("🔄 Admin kullanıcısı oluşturuluyor...\n");

  try {
    // Varsayılan admin bilgileri
    const adminData = {
      email: "admin@campussummer.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      adminCode: "ADMIN001"
    };

    // Email kontrolü
    const existingUser = await sql`SELECT id FROM users WHERE email = ${adminData.email}`;
    if (existingUser.length > 0) {
      console.log("⚠️  Bu e-posta adresi zaten kayıtlı!");
      console.log("💡 Mevcut admin bilgileri:");
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Admin Kodu: ${adminData.adminCode}`);
      console.log(`   Şifre: ${adminData.password}`);
      process.exit(0);
      return;
    }

    // Admin kodu kontrolü
    const existingAdmin = await sql`SELECT id FROM admins WHERE admin_code = ${adminData.adminCode}`;
    if (existingAdmin.length > 0) {
      console.log("⚠️  Bu admin kodu zaten kayıtlı!");
      process.exit(0);
      return;
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminData.password, salt);

    // Kullanıcıyı oluştur
    console.log("📝 Kullanıcı oluşturuluyor...");
    const newUser = await sql`
      INSERT INTO users (email, password_hash, user_type, first_name, last_name)
      VALUES (${adminData.email}, ${passwordHash}, 'admin', ${adminData.firstName}, ${adminData.lastName})
      RETURNING id, email, user_type, first_name, last_name
    `;
    console.log("✅ Kullanıcı oluşturuldu\n");

    // Admin kaydı oluştur
    console.log("📝 Admin kaydı oluşturuluyor...");
    const adminCount = await sql`SELECT COUNT(*) as count FROM admins`;
    const isFirstAdmin = adminCount[0].count === 0;

    await sql`
      INSERT INTO admins (user_id, admin_code, is_super_admin)
      VALUES (${newUser[0].id}, ${adminData.adminCode}, ${isFirstAdmin})
    `;
    console.log("✅ Admin kaydı oluşturuldu\n");

    console.log("🎉 Admin kullanıcısı başarıyla oluşturuldu!\n");
    console.log("📋 Giriş Bilgileri:");
    console.log("   Email: " + adminData.email);
    console.log("   Admin Kodu: " + adminData.adminCode);
    console.log("   Şifre: " + adminData.password);
    console.log("   Super Admin: " + (isFirstAdmin ? "Evet" : "Hayır"));
    console.log("\n💡 Artık admin giriş sayfasından giriş yapabilirsiniz!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Hata oluştu:", error.message);
    console.error("\n🔍 Detaylar:", error);
    process.exit(1);
  }
}

// Script'i çalıştır
createAdmin();



