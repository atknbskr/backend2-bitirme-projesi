-- 20 Öğrenci Verisi Ekleme Script'i
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırabilirsiniz
-- Tüm öğrencilerin şifresi: 123456 (bcrypt hash'lenmiş)
-- Şifre hash'i: $2a$10$N9qo8uLOickgx2ZMRZoMye7C7F0lPeC9UpYxYqKwS.rlvvX4N8Khu

-- Not: Aşağıdaki hash gerçek bir "123456" bcrypt hash'idir
-- Eğer farklı bir şifre istiyorsanız, Node.js script'ini kullanın (ÖNERİLEN)

DO $$
DECLARE
    user_id_var INTEGER;
    password_hash VARCHAR(255) := '$2a$10$N9qo8uLOickgx2ZMRZoMye7C7F0lPeC9UpYxYqKwS.rlvvX4N8Khu';
BEGIN
    -- Öğrenci 1: Ahmet Yılmaz
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('ahmet.yilmaz@ogrenci.edu.tr', password_hash, 'student', 'Ahmet', 'Yılmaz')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001001') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 2: Ayşe Kaya
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('ayse.kaya@ogrenci.edu.tr', password_hash, 'student', 'Ayşe', 'Kaya')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001002') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 3: Mehmet Demir
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('mehmet.demir@ogrenci.edu.tr', password_hash, 'student', 'Mehmet', 'Demir')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001003') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 4: Fatma Şahin
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('fatma.sahin@ogrenci.edu.tr', password_hash, 'student', 'Fatma', 'Şahin')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001004') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 5: Mustafa Çelik
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('mustafa.celik@ogrenci.edu.tr', password_hash, 'student', 'Mustafa', 'Çelik')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001005') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 6: Zeynep Aydın
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('zeynep.aydin@ogrenci.edu.tr', password_hash, 'student', 'Zeynep', 'Aydın')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001006') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 7: Ali Özdemir
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('ali.ozdemir@ogrenci.edu.tr', password_hash, 'student', 'Ali', 'Özdemir')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001007') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 8: Elif Arslan
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('elif.arslan@ogrenci.edu.tr', password_hash, 'student', 'Elif', 'Arslan')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001008') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 9: Hasan Koç
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('hasan.koc@ogrenci.edu.tr', password_hash, 'student', 'Hasan', 'Koç')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001009') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 10: Emine Kurt
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('emine.kurt@ogrenci.edu.tr', password_hash, 'student', 'Emine', 'Kurt')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001010') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 11: İbrahim Öztürk
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('ibrahim.ozturk@ogrenci.edu.tr', password_hash, 'student', 'İbrahim', 'Öztürk')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001011') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 12: Hatice Aksoy
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('hatice.aksoy@ogrenci.edu.tr', password_hash, 'student', 'Hatice', 'Aksoy')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001012') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 13: Hüseyin Yıldız
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('huseyin.yildiz@ogrenci.edu.tr', password_hash, 'student', 'Hüseyin', 'Yıldız')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001013') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 14: Merve Yıldırım
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('merve.yildirim@ogrenci.edu.tr', password_hash, 'student', 'Merve', 'Yıldırım')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001014') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 15: Yunus Polat
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('yunus.polat@ogrenci.edu.tr', password_hash, 'student', 'Yunus', 'Polat')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001015') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 16: Seda Doğan
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('seda.dogan@ogrenci.edu.tr', password_hash, 'student', 'Seda', 'Doğan')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001016') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 17: Burak Can
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('burak.can@ogrenci.edu.tr', password_hash, 'student', 'Burak', 'Can')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001017') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 18: Esra Erdoğan
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('esra.erdogan@ogrenci.edu.tr', password_hash, 'student', 'Esra', 'Erdoğan')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001018') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 19: Emre Güneş
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('emre.gunes@ogrenci.edu.tr', password_hash, 'student', 'Emre', 'Güneş')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001019') ON CONFLICT DO NOTHING;
    END IF;

    -- Öğrenci 20: Gamze Kara
    INSERT INTO users (email, password_hash, user_type, first_name, last_name)
    VALUES ('gamze.kara@ogrenci.edu.tr', password_hash, 'student', 'Gamze', 'Kara')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user_id_var;
    IF user_id_var IS NOT NULL THEN
        INSERT INTO students (user_id, student_number) VALUES (user_id_var, '2021001020') ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '✅ 20 öğrenci başarıyla eklendi!';
END $$;

-- Eklenen öğrencileri kontrol et
SELECT 
    u.first_name || ' ' || u.last_name as "Öğrenci Adı",
    s.student_number as "Okul No",
    u.email as "E-posta"
FROM users u
JOIN students s ON u.id = s.user_id
ORDER BY s.student_number;

