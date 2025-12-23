-- Courses tablosuna faculty_id kolonu ekle
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- 1. Faculty ID kolonunu ekle
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL;

-- 2. İndeks ekle
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON courses(faculty_id);

-- 3. Mevcut dersleri kontrol et
SELECT 
    c.id,
    c.course_name,
    c.course_code,
    c.faculty_id,
    f.name as faculty_name,
    a.username as academician_name
FROM courses c
LEFT JOIN faculties f ON c.faculty_id = f.id
LEFT JOIN academicians a ON c.academician_id = a.id
ORDER BY c.id
LIMIT 20;

-- 4. Fakülteleri listele
SELECT id, name, university_id FROM faculties ORDER BY name;



