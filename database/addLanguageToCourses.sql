-- Courses tablosuna language alanı ekle
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'turkish' CHECK (language IN ('turkish', 'english'));

-- Mevcut derslerin dilini Türkçe olarak ayarla
UPDATE courses
SET language = 'turkish'
WHERE language IS NULL;

-- Başarı mesajı
SELECT 'Language alanı başarıyla eklendi! ✅' as mesaj;



