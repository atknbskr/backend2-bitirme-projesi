-- Akademisyeni olmayan derslere akademisyen atama (Basit versiyon)
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- Önce durumu kontrol edin
SELECT 
    'Akademisyeni olmayan dersler' as durum,
    COUNT(*) as sayi
FROM courses
WHERE academician_id IS NULL

UNION ALL

SELECT 
    'Toplam ders sayısı' as durum,
    COUNT(*) as sayi
FROM courses

UNION ALL

SELECT 
    'Mevcut akademisyen sayısı' as durum,
    COUNT(*) as sayi
FROM academicians;

-- Akademisyeni olmayan dersleri göster
SELECT 
    id,
    course_name,
    course_code,
    category
FROM courses
WHERE academician_id IS NULL
ORDER BY id;

-- Akademisyeni olmayan derslere ilk akademisyeni ata
-- (Tüm dersler aynı akademisyene atanır - daha sonra manuel olarak dağıtabilirsiniz)
UPDATE courses
SET academician_id = (
    SELECT id FROM academicians ORDER BY id LIMIT 1
)
WHERE academician_id IS NULL
AND EXISTS (SELECT 1 FROM academicians LIMIT 1);

-- Güncellenmiş durumu kontrol et
SELECT 
    'Güncelleme sonrası' as durum,
    COUNT(*) as toplam_ders,
    COUNT(academician_id) as akademisyenli_ders,
    COUNT(*) - COUNT(academician_id) as akademisyensiz_ders
FROM courses;
















