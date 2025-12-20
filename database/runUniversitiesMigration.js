const sql = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Üniversiteler tablosu oluşturuluyor...');
    
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'CREATE_UNIVERSITIES_TABLE.sql'), 
      'utf8'
    );
    
    // SQL script'i çalıştır
    await sql.unsafe(sqlScript);
    
    console.log('✅ Üniversiteler tablosu başarıyla oluşturuldu!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

runMigration();

