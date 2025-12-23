-- summer_school_registrations tablosuna failed_course_id kolonu ekleme
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- Önce kolonun var olup olmadığını kontrol et
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'summer_school_registrations' 
        AND column_name = 'failed_course_id'
    ) THEN
        -- Önce student_failed_courses tablosunun var olup olmadığını kontrol et
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'student_failed_courses'
        ) THEN
            -- Foreign key ile ekle
            ALTER TABLE summer_school_registrations
            ADD COLUMN failed_course_id INTEGER REFERENCES student_failed_courses(id) ON DELETE SET NULL;
            RAISE NOTICE 'failed_course_id kolonu başarıyla eklendi (foreign key ile)!';
        ELSE
            -- Foreign key olmadan ekle
            ALTER TABLE summer_school_registrations
            ADD COLUMN failed_course_id INTEGER;
            RAISE NOTICE 'failed_course_id kolonu başarıyla eklendi (foreign key olmadan)!';
        END IF;
    ELSE
        RAISE NOTICE 'failed_course_id kolonu zaten mevcut.';
    END IF;
END $$;

-- Kontrol için tablo yapısını göster
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'summer_school_registrations'
ORDER BY ordinal_position;

