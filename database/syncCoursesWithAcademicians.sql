-- Dersleri akademisyenlerle eşleştirme ve akademisyeni olmayan derslere akademisyen atama
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- 1. Önce akademisyeni olmayan dersleri göster
SELECT 
    c.id,
    c.course_name,
    c.course_code,
    c.category,
    c.academician_id
FROM courses c
WHERE c.academician_id IS NULL
ORDER BY c.id;

-- 2. Mevcut akademisyenleri göster
SELECT 
    a.id,
    a.user_id,
    u.first_name || ' ' || u.last_name as full_name,
    u.email,
    a.username
FROM academicians a
JOIN users u ON a.user_id = u.id
ORDER BY a.id;

-- 3. Akademisyeni olmayan derslere akademisyen ata (round-robin yöntemi)
-- NOT: Bu script, mevcut akademisyenleri döngüsel olarak atar
-- Önce kaç akademisyen olduğunu kontrol edin

DO $$
DECLARE
    course_record RECORD;
    academician_record RECORD;
    academician_count INTEGER;
    current_index INTEGER := 0;
    academician_cursor CURSOR FOR 
        SELECT a.id 
        FROM academicians a 
        ORDER BY a.id;
BEGIN
    -- Akademisyen sayısını al
    SELECT COUNT(*) INTO academician_count FROM academicians;
    
    IF academician_count = 0 THEN
        RAISE NOTICE 'Veritabanında akademisyen bulunamadı!';
        RETURN;
    END IF;
    
    -- Akademisyeni olmayan her ders için
    FOR course_record IN 
        SELECT id, course_name, course_code 
        FROM courses 
        WHERE academician_id IS NULL 
        ORDER BY id
    LOOP
        -- Akademisyenleri döngüsel olarak seç
        OPEN academician_cursor;
        FETCH ABSOLUTE ((current_index % academician_count) + 1) FROM academician_cursor INTO academician_record;
        CLOSE academician_cursor;
        
        -- Akademisyeni ata
        UPDATE courses
        SET academician_id = academician_record.id
        WHERE id = course_record.id;
        
        RAISE NOTICE 'Ders "%" (%%) akademisyen % atandı', 
            course_record.course_name, 
            COALESCE(course_record.course_code, 'Kod yok'),
            academician_record.id;
        
        current_index := current_index + 1;
    END LOOP;
    
    RAISE NOTICE 'İşlem tamamlandı!';
END $$;

-- 4. Güncellenmiş durumu kontrol et
SELECT 
    COUNT(*) as total_courses,
    COUNT(academician_id) as courses_with_academician,
    COUNT(*) - COUNT(academician_id) as courses_without_academician
FROM courses;

-- 5. Her akademisyenin kaç dersi olduğunu göster
SELECT 
    a.id,
    u.first_name || ' ' || u.last_name as academician_name,
    COUNT(c.id) as course_count
FROM academicians a
LEFT JOIN courses c ON c.academician_id = a.id
JOIN users u ON a.user_id = u.id
GROUP BY a.id, u.first_name, u.last_name
ORDER BY course_count DESC, a.id;












