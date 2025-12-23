-- Yaz Okulu Derslerine Udemy Link Alanı Ekleme
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- summer_school_offerings tablosuna udemy_link alanı ekle
ALTER TABLE summer_school_offerings 
ADD COLUMN IF NOT EXISTS udemy_link VARCHAR(500);

-- Açıklama ekle (opsiyonel)
COMMENT ON COLUMN summer_school_offerings.udemy_link IS 'Udemy ders linki - öğrenciler bu linke tıklayarak ders videolarına erişebilir';

SELECT 'Udemy link alanı başarıyla eklendi!' as mesaj;

