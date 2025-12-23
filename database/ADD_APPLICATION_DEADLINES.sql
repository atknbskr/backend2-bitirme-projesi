-- Yaz Okulu Başvuru Tarihlerini Güncelleme
-- Bu SQL dosyasını Neon Dashboard > SQL Editor'de çalıştırabilirsiniz

-- 1. application_deadline sütunu ekle
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS application_deadline DATE;

-- 2. start_date sütunu ekle
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS start_date DATE;

-- 3. end_date sütunu ekle
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- 4. Mevcut tüm derslerin tarihlerini güncelle
UPDATE courses 
SET 
  application_deadline = '2026-06-30',
  start_date = '2026-07-01',
  end_date = '2026-08-31'
WHERE application_deadline IS NULL OR application_deadline < CURRENT_DATE;

-- 5. İndeks ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_courses_application_deadline 
ON courses(application_deadline);

-- 6. Kontrol sorgusu
SELECT 
  id, 
  course_name, 
  application_deadline, 
  start_date, 
  end_date,
  CASE 
    WHEN application_deadline >= CURRENT_DATE THEN '✅ Aktif'
    ELSE '❌ Süresi Geçmiş'
  END as durum
FROM courses 
ORDER BY application_deadline DESC
LIMIT 10;

-- Başarı mesajı
SELECT 'Başvuru tarihleri başarıyla güncellendi! ✅' as mesaj;









