-- Favorites tablosuna status alanı ekle
-- Bu migration favorites tablosuna başvuru durumu için status alanı ekler

-- Status alanını ekle (varsayılan değer: 'pending')
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Mevcut kayıtları 'approved' olarak işaretle (geriye dönük uyumluluk için)
UPDATE favorites 
SET status = 'approved' 
WHERE status IS NULL OR status = 'pending';

-- Status alanını NOT NULL yap
ALTER TABLE favorites 
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN status SET NOT NULL;

-- İndeks ekle
CREATE INDEX IF NOT EXISTS idx_favorites_status ON favorites(status);
CREATE INDEX IF NOT EXISTS idx_favorites_course_status ON favorites(course_id, status);

SELECT 'Favorites tablosuna status alanı başarıyla eklendi!' as mesaj;

