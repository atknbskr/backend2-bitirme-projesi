-- İki veritabanı arasında dersleri eşleştirme
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın
-- ÖNEMLİ: Önce kaynak veritabanından (source) verileri kontrol edin

-- 1. Mevcut durumu kontrol et
SELECT 
    'Kaynak veritabanındaki dersler' as bilgi,
    COUNT(*) as sayi
FROM courses;

SELECT 
    'Hedef veritabanındaki dersler' as bilgi,
    COUNT(*) as sayi
FROM courses;

-- 2. Akademisyeni olmayan dersleri göster
SELECT 
    id,
    course_name,
    course_code,
    category,
    academician_id
FROM courses
WHERE academician_id IS NULL
ORDER BY id;

-- 3. Akademisyenleri göster
SELECT 
    a.id,
    u.first_name || ' ' || u.last_name as academician_name,
    u.email,
    COUNT(c.id) as mevcut_ders_sayisi
FROM academicians a
JOIN users u ON a.user_id = u.id
LEFT JOIN courses c ON c.academician_id = a.id
GROUP BY a.id, u.first_name, u.last_name, u.email
ORDER BY a.id;

-- 4. Akademisyeni olmayan derslere akademisyen ata (Eşit dağıtım)
-- Bu script, dersleri mevcut akademisyenlere eşit olarak dağıtır

WITH numbered_courses AS (
    SELECT 
        id,
        course_name,
        course_code,
        ROW_NUMBER() OVER (ORDER BY id) as row_num
    FROM courses
    WHERE academician_id IS NULL
),
numbered_academicians AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) as row_num,
        COUNT(*) OVER () as total_count
    FROM academicians
)
UPDATE courses c
SET academician_id = na.id
FROM numbered_courses nc
JOIN numbered_academicians na ON (nc.row_num - 1) % na.total_count + 1 = na.row_num
WHERE c.id = nc.id
AND c.academician_id IS NULL;

-- 5. Güncellenmiş durumu kontrol et
SELECT 
    'Güncelleme sonrası' as durum,
    COUNT(*) as toplam_ders,
    COUNT(academician_id) as akademisyenli_ders,
    COUNT(*) - COUNT(academician_id) as akademisyensiz_ders
FROM courses;

-- 6. Her akademisyenin ders dağılımını göster
SELECT 
    a.id,
    u.first_name || ' ' || u.last_name as academician_name,
    COUNT(c.id) as ders_sayisi,
    STRING_AGG(c.course_name, ', ' ORDER BY c.id) as dersler
FROM academicians a
LEFT JOIN courses c ON c.academician_id = a.id
JOIN users u ON a.user_id = u.id
GROUP BY a.id, u.first_name, u.last_name
ORDER BY ders_sayisi DESC, a.id;





