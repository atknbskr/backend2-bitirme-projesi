-- summer_school_offerings tablosuna language alanı ekle
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

ALTER TABLE summer_school_offerings
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'turkish' CHECK (language IN ('turkish', 'english'));

-- Mevcut tekliflerin dilini Türkçe olarak ayarla
UPDATE summer_school_offerings
SET language = 'turkish'
WHERE language IS NULL;

-- Başarı mesajı
SELECT 'Language alanı summer_school_offerings tablosuna başarıyla eklendi! ✅' as mesaj;


