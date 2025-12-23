// Test script for courses API
const sql = require("./config/db");

async function testCoursesAPI() {
  console.log('🧪 Courses API Test Başlatılıyor...\n');
  
  try {
    // 1. Veritabanı bağlantısını test et
    console.log('1️⃣ Veritabanı bağlantısı test ediliyor...');
    const dbTest = await sql`SELECT 1 as test`;
    console.log('✅ Veritabanı bağlantısı başarılı\n');
    
    // 2. Courses tablosunun var olup olmadığını kontrol et
    console.log('2️⃣ Courses tablosu kontrol ediliyor...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
      )
    `;
    
    if (!tableCheck[0].exists) {
      console.error('❌ courses tablosu bulunamadı!');
      console.log('💡 Veritabanı şemasını oluşturmanız gerekiyor.');
      process.exit(1);
    }
    console.log('✅ courses tablosu mevcut\n');
    
    // 3. Courses tablosundaki kolonları kontrol et
    console.log('3️⃣ Courses tablosu kolonları kontrol ediliyor...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `;
    console.log('Kolonlar:', columns.map(c => c.column_name).join(', '));
    console.log('✅ Kolonlar kontrol edildi\n');
    
    // 4. Ders sayısını kontrol et
    console.log('4️⃣ Ders sayısı kontrol ediliyor...');
    const courseCount = await sql`SELECT COUNT(*) as count FROM courses`;
    console.log(`Toplam ders sayısı: ${courseCount[0].count}\n`);
    
    // 5. getAllCourses sorgusunu test et
    console.log('5️⃣ getAllCourses sorgusu test ediliyor...');
    const courses = await sql`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.academician_id,
        COALESCE(c.university_count, 0) as university_count,
        COALESCE(c.student_count, 0) as student_count,
        c.application_deadline,
        c.start_date,
        c.end_date,
        c.created_at,
        COALESCE(u.first_name || ' ' || u.last_name, 'Belirtilmemiş') as academician_name,
        CASE 
          WHEN c.application_deadline IS NULL THEN true
          WHEN c.application_deadline >= CURRENT_DATE THEN true
          ELSE false
        END as is_active
      FROM courses c
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE c.application_deadline IS NULL OR c.application_deadline >= CURRENT_DATE
      ORDER BY c.created_at DESC
      LIMIT 5
    `;
    
    console.log(`✅ Sorgu başarılı! ${courses.length} ders bulundu (ilk 5)`);
    if (courses.length > 0) {
      console.log('\nİlk ders örneği:');
      console.log(JSON.stringify(courses[0], null, 2));
    }
    
    console.log('\n✅ Tüm testler başarılı!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test başarısız!');
    console.error('Hata:', error.message);
    console.error('Hata kodu:', error.code);
    console.error('Hata detayı:', error.detail);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

testCoursesAPI();


