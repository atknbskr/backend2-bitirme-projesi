-- Gaziantep Üniversitelerini Ekle

-- Önce var olanları kontrol edelim ve sadece yoksa ekleyelim
DO $$
BEGIN
    -- Gaziantep Üniversitesi
    IF NOT EXISTS (SELECT 1 FROM universities WHERE name = 'Gaziantep Üniversitesi') THEN
        INSERT INTO universities (name, city, type, website, description) 
        VALUES ('Gaziantep Üniversitesi', 'Gaziantep', 'devlet', 'https://www.gantep.edu.tr', 'Gaziantep''in köklü devlet üniversitesi');
        RAISE NOTICE 'Gaziantep Üniversitesi eklendi';
    ELSE
        RAISE NOTICE 'Gaziantep Üniversitesi zaten mevcut';
    END IF;

    -- Gaziantep İslam Bilim ve Teknoloji Üniversitesi
    IF NOT EXISTS (SELECT 1 FROM universities WHERE name = 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi') THEN
        INSERT INTO universities (name, city, type, website, description) 
        VALUES ('Gaziantep İslam Bilim ve Teknoloji Üniversitesi', 'Gaziantep', 'devlet', 'https://www.gibtu.edu.tr', 'İslam bilim ve teknoloji odaklı devlet üniversitesi');
        RAISE NOTICE 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi eklendi';
    ELSE
        RAISE NOTICE 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi zaten mevcut';
    END IF;

    -- Hasan Kalyoncu Üniversitesi (ekle veya güncelle)
    IF NOT EXISTS (SELECT 1 FROM universities WHERE name = 'Hasan Kalyoncu Üniversitesi') THEN
        INSERT INTO universities (name, city, type, website, description) 
        VALUES ('Hasan Kalyoncu Üniversitesi', 'Gaziantep', 'vakıf', 'https://www.hku.edu.tr', 'Gaziantep''te bulunan vakıf üniversitesi');
        RAISE NOTICE 'Hasan Kalyoncu Üniversitesi eklendi';
    ELSE
        UPDATE universities 
        SET city = 'Gaziantep', 
            type = 'vakıf',
            website = 'https://www.hku.edu.tr',
            description = 'Gaziantep''te bulunan vakıf üniversitesi'
        WHERE name = 'Hasan Kalyoncu Üniversitesi';
        RAISE NOTICE 'Hasan Kalyoncu Üniversitesi güncellendi';
    END IF;
END $$;

SELECT 'Gaziantep üniversiteleri başarıyla eklendi/güncellendi!' as mesaj;

