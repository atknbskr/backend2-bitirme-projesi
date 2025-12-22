-- Başarısız Ders Özelliğini Kaldırma
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- 1. summer_school_registrations tablosundan failed_course_id kolonunu kaldır
ALTER TABLE summer_school_registrations DROP COLUMN IF EXISTS failed_course_id;

-- 2. student_failed_courses tablosunu sil (CASCADE ile ilişkili kayıtlar da silinir)
DROP TABLE IF EXISTS student_failed_courses CASCADE;

-- 3. İlgili indeksleri temizle (zaten CASCADE ile silinmiş olabilir)
DROP INDEX IF EXISTS idx_student_failed_courses_student_id;
DROP INDEX IF EXISTS idx_student_failed_courses_course_code;

SELECT 'Başarısız ders özelliği başarıyla kaldırıldı!' as mesaj;






