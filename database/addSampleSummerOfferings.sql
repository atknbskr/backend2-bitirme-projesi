-- Gaziantep Yaz Okulu Örnek Dersleri
-- NOT: Bu script'i çalıştırmadan önce:
-- 1. createSummerSchoolTables.sql çalıştırılmış olmalı
-- 2. addGaziantepUniversities.sql çalıştırılmış olmalı
-- 3. En az bir akademisyen hesabı oluşturulmuş olmalı

-- Önce üniversite ID'lerini alalım
DO $$
DECLARE
    hku_id INTEGER;
    gantep_id INTEGER;
    gibtu_id INTEGER;
    sample_academician_id INTEGER;
BEGIN
    -- Üniversite ID'lerini al
    SELECT id INTO hku_id FROM universities WHERE name = 'Hasan Kalyoncu Üniversitesi';
    SELECT id INTO gantep_id FROM universities WHERE name = 'Gaziantep Üniversitesi';
    SELECT id INTO gibtu_id FROM universities WHERE name = 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi';
    
    -- Üniversiteler bulunamazsa hata ver
    IF hku_id IS NULL THEN
        RAISE EXCEPTION 'Hasan Kalyoncu Üniversitesi bulunamadı! Önce addGaziantepUniversities.sql çalıştırın.';
    END IF;
    
    IF gantep_id IS NULL THEN
        RAISE EXCEPTION 'Gaziantep Üniversitesi bulunamadı! Önce addGaziantepUniversities.sql çalıştırın.';
    END IF;
    
    IF gibtu_id IS NULL THEN
        RAISE EXCEPTION 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi bulunamadı! Önce addGaziantepUniversities.sql çalıştırın.';
    END IF;
    
    -- İlk akademisyeni al (eğer varsa)
    SELECT id INTO sample_academician_id FROM academicians LIMIT 1;
    
    -- Akademisyen yoksa NULL olarak devam et (bu sorun değil)
    IF sample_academician_id IS NULL THEN
        RAISE NOTICE 'Akademisyen bulunamadı, dersler akademisyen olmadan eklenecek';
    END IF;

    -- MATEMATİK DERSLERİ
    INSERT INTO summer_school_offerings (
        university_id, academician_id, course_name, course_code, description,
        course_hours, credits, start_date, end_date, application_start_date, 
        application_deadline, price, quota, equivalency_info, requirements
    ) VALUES
    -- Matematik I - 3 farklı üniversitede
    (hku_id, sample_academician_id, 'Matematik I', 'MAT101', 
     'Temel matematik kavramları, limit, türev ve integral konularını kapsar.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     500.00, 40, 'Tüm mühendislik bölümlerinin MAT101 dersi ile denkdir.', 
     'Lise matematik bilgisi yeterlidir.'),
    
    (gantep_id, sample_academician_id, 'Matematik I', 'MAT101',
     'Fonksiyonlar, limit, süreklilik, türev ve uygulamaları.',
     56, 4, '2024-07-20', '2024-08-20', '2024-06-01', '2024-06-30',
     450.00, 50, 'Mühendislik fakültesi MAT101 dersi ile denkdir.',
     'Lise mezunu olmak.'),
    
    (gibtu_id, sample_academician_id, 'Matematik I', 'MAT101',
     'Temel analiz, türev ve integral hesabı.',
     56, 4, '2024-07-22', '2024-08-22', '2024-06-01', '2024-06-30',
     480.00, 35, 'MAT101 veya eşdeğeri dersler için geçerlidir.',
     'Temel matematik bilgisi.'),

    -- Matematik II
    (hku_id, sample_academician_id, 'Matematik II', 'MAT102',
     'Çok değişkenli fonksiyonlar, çift ve üçlü integraller, vektör analizi.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     500.00, 35, 'MAT102 veya Matematik II dersleri ile denkdir.',
     'MAT101 dersini başarmış olmak.'),
    
    (gantep_id, sample_academician_id, 'Matematik II', 'MAT102',
     'İntegral uygulamaları, seri ve dizi, diferansiyel denklemlere giriş.',
     56, 4, '2024-07-20', '2024-08-20', '2024-06-01', '2024-06-30',
     450.00, 40, 'Mühendislik MAT102 ile denkdir.',
     'MAT101 veya dengi ders başarılı.'),

    -- Diferansiyel Denklemler
    (hku_id, sample_academician_id, 'Diferansiyel Denklemler', 'MAT201',
     'Birinci ve ikinci mertebe diferansiyel denklemler ve çözüm yöntemleri.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     550.00, 30, 'MAT201, MAT301 veya Diferansiyel Denklemler dersleri ile denkdir.',
     'MAT102 başarılı olmak.'),
    
    (gantep_id, sample_academician_id, 'Diferansiyel Denklemler', 'MAT203',
     'ODE ve PDE çözüm teknikleri, Laplace dönüşümü.',
     42, 3, '2024-07-22', '2024-08-12', '2024-06-01', '2024-06-30',
     520.00, 35, 'Diferansiyel denklemler dersleri ile denkdir.',
     'Matematik II başarılı.'),

    -- Lineer Cebir
    (hku_id, sample_academician_id, 'Lineer Cebir', 'MAT203',
     'Matrisler, determinantlar, vektör uzayları, özdeğer ve özvektörler.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     550.00, 40, 'MAT203, MAT204 veya Lineer Cebir dersleri ile denkdir.',
     'MAT101 başarılı.'),

    -- FİZİK DERSLERİ
    (hku_id, sample_academician_id, 'Fizik I', 'FIZ101',
     'Mekanik, hareket, kuvvet, enerji ve momentum konuları.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     450.00, 45, 'Mühendislik Fizik I dersleri ile denkdir.',
     'Lise fizik bilgisi.'),
    
    (gantep_id, sample_academician_id, 'Fizik I', 'FIZ101',
     'Klasik mekanik, Newton yasaları, iş ve enerji.',
     56, 4, '2024-07-20', '2024-08-20', '2024-06-01', '2024-06-30',
     420.00, 50, 'FIZ101 veya Fizik I ile denkdir.',
     'Temel matematik bilgisi.'),

    (hku_id, sample_academician_id, 'Fizik II', 'FIZ102',
     'Elektrik, manyetizma, optik ve modern fizik konuları.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     450.00, 40, 'FIZ102 veya Fizik II ile denkdir.',
     'FIZ101 başarılı.'),
    
    (gantep_id, sample_academician_id, 'Fizik II', 'FIZ102',
     'Elektromanyetik, dalgalar ve modern fizik.',
     56, 4, '2024-07-20', '2024-08-20', '2024-06-01', '2024-06-30',
     420.00, 45, 'Fizik II dersleri ile denkdir.',
     'Fizik I başarılı.'),

    -- KİMYA DERSLERİ
    (hku_id, sample_academician_id, 'Genel Kimya', 'KIM101',
     'Atomik yapı, kimyasal bağlar, tepkimeler ve stokiyometri.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     480.00, 35, 'KIM101, Genel Kimya dersleri ile denkdir.',
     'Lise kimya bilgisi.'),
    
    (gantep_id, sample_academician_id, 'Genel Kimya', 'KIM101',
     'Temel kimya kavramları, periyodik tablo, kimyasal tepkimeler.',
     56, 4, '2024-07-22', '2024-08-22', '2024-06-01', '2024-06-30',
     450.00, 40, 'Genel Kimya ile denkdir.',
     'Temel kimya bilgisi.'),

    -- BİLGİSAYAR MÜHENDİSLİĞİ DERSLERİ
    (hku_id, sample_academician_id, 'Veri Yapıları ve Algoritmalar', 'CSE102',
     'Temel veri yapıları, sıralama ve arama algoritmaları, karmaşıklık analizi.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     600.00, 30, 'CSE102, BIL102 veya Veri Yapıları dersleri ile denkdir.',
     'Programlama bilgisi (C/C++/Java).'),
    
    (gantep_id, sample_academician_id, 'Veri Yapıları', 'BIL212',
     'Liste, yığın, kuyruk, ağaç ve graf veri yapıları.',
     56, 4, '2024-07-20', '2024-08-20', '2024-06-01', '2024-06-30',
     580.00, 35, 'Veri Yapıları dersleri ile denkdir.',
     'C veya Java programlama bilgisi.'),

    (hku_id, sample_academician_id, 'Algoritmalar', 'CSE201',
     'İleri algoritma tasarımı, dinamik programlama, açgözlü algoritmalar.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     600.00, 25, 'CSE201, Algoritma Analizi dersleri ile denkdir.',
     'Veri Yapıları başarılı.'),

    (hku_id, sample_academician_id, 'Nesneye Yönelik Programlama', 'CSE202',
     'OOP kavramları, sınıf tasarımı, kalıtım, polimorfizm, Java programlama.',
     56, 4, '2024-07-15', '2024-08-15', '2024-06-01', '2024-06-30',
     600.00, 35, 'CSE202, BIL201 veya OOP dersleri ile denkdir.',
     'Temel programlama bilgisi.'),
    
    (gantep_id, sample_academician_id, 'Nesneye Yönelik Programlama', 'BIL202',
     'Java ile nesne yönelimli programlama, tasarım kalıpları.',
     56, 4, '2024-07-22', '2024-08-22', '2024-06-01', '2024-06-30',
     580.00, 40, 'OOP dersleri ile denkdir.',
     'C veya Java bilgisi.'),

    (hku_id, sample_academician_id, 'Veritabanı Sistemleri', 'CSE301',
     'İlişkisel veritabanı tasarımı, SQL, normalizasyon, işlemler.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     650.00, 30, 'CSE301, BIL301 veya Veritabanı dersleri ile denkdir.',
     'Veri Yapıları başarılı.'),
    
    (gantep_id, sample_academician_id, 'Veritabanı Yönetim Sistemleri', 'BIL312',
     'SQL, veritabanı tasarımı, PostgreSQL ve MySQL uygulamaları.',
     42, 3, '2024-07-20', '2024-08-10', '2024-06-01', '2024-06-30',
     620.00, 35, 'Veritabanı dersleri ile denkdir.',
     'Temel programlama.'),

    -- ZORUNLU DERSLER
    (hku_id, sample_academician_id, 'İngilizce I', 'ING101',
     'Temel İngilizce gramer, okuma ve yazma becerileri.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     400.00, 50, 'Tüm üniversitelerin İngilizce I dersi ile denkdir.',
     'Temel İngilizce bilgisi.'),
    
    (gantep_id, sample_academician_id, 'İngilizce I', 'YDI101',
     'Temel İngilizce dil becerileri, gramer ve kelime.',
     42, 3, '2024-07-20', '2024-08-10', '2024-06-01', '2024-06-30',
     380.00, 60, 'İngilizce I ile denkdir.',
     'Yok.'),
    
    (gibtu_id, sample_academician_id, 'İngilizce I', 'ENG101',
     'Akademik İngilizce, okuma ve yazma.',
     42, 3, '2024-07-22', '2024-08-12', '2024-06-01', '2024-06-30',
     400.00, 45, 'İngilizce I dersleri ile denkdir.',
     'Temel seviye İngilizce.'),

    (hku_id, sample_academician_id, 'İngilizce II', 'ING102',
     'İleri seviye İngilizce, akademik yazma ve sunum becerileri.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     400.00, 45, 'İngilizce II dersleri ile denkdir.',
     'İngilizce I başarılı.'),
    
    (gantep_id, sample_academician_id, 'İngilizce II', 'YDI102',
     'İleri gramer, akademik okuma ve yazma.',
     42, 3, '2024-07-20', '2024-08-10', '2024-06-01', '2024-06-30',
     380.00, 50, 'İngilizce II ile denkdir.',
     'İngilizce I başarılı.'),

    (hku_id, sample_academician_id, 'Türk Dili I', 'TDL101',
     'Türk dilinin yapısı, yazılı ve sözlü anlatım teknikleri.',
     28, 2, '2024-07-15', '2024-08-05', '2024-06-01', '2024-06-30',
     300.00, 60, 'Tüm üniversitelerin Türk Dili dersleri ile denkdir.',
     'Yok.'),
    
    (gantep_id, sample_academician_id, 'Türk Dili', 'TDL101',
     'Türkçe dil bilgisi, kompozisyon ve etkili iletişim.',
     28, 2, '2024-07-20', '2024-08-05', '2024-06-01', '2024-06-30',
     280.00, 70, 'Türk Dili ile denkdir.',
     'Yok.'),

    (hku_id, sample_academician_id, 'Atatürk İlkeleri ve İnkılap Tarihi I', 'ATA101',
     'Türk İnkılap Tarihi, Atatürk ilkeleri ve Türkiye Cumhuriyeti tarihi.',
     28, 2, '2024-07-15', '2024-08-05', '2024-06-01', '2024-06-30',
     300.00, 60, 'ATA101, AİT101 dersleri ile denkdir.',
     'Yok.'),
    
    (gantep_id, sample_academician_id, 'Atatürk İlkeleri ve İnkılap Tarihi', 'AIT101',
     'Türk İnkılabı, Atatürk dönemi ve ilkeler.',
     28, 2, '2024-07-22', '2024-08-07', '2024-06-01', '2024-06-30',
     280.00, 70, 'Atatürk İlkeleri dersleri ile denkdir.',
     'Yok.'),

    -- İŞLETME/İKTİSAT DERSLERİ
    (hku_id, sample_academician_id, 'Genel Muhasebe', 'ISL101',
     'Temel muhasebe kavramları, mali tablolar, kayıt sistemleri.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     500.00, 40, 'İşletme, İktisat ve İİBF bölümlerinin Muhasebe dersleri ile denkdir.',
     'Temel matematik bilgisi.'),
    
    (gantep_id, sample_academician_id, 'Genel Muhasebe I', 'MUH101',
     'Muhasebe döngüsü, hesap planı, kayıt ve raporlama.',
     42, 3, '2024-07-20', '2024-08-10', '2024-06-01', '2024-06-30',
     480.00, 45, 'Muhasebe dersleri ile denkdir.',
     'Yok.'),

    (hku_id, sample_academician_id, 'Mikroekonomi', 'EKO101',
     'Arz-talep analizi, piyasa yapıları, tüketici ve üretici teorisi.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     500.00, 35, 'EKO101, İKT101 veya Mikroekonomi dersleri ile denkdir.',
     'Temel matematik.'),
    
    (gantep_id, sample_academician_id, 'Mikroiktisat', 'IKT101',
     'Tüketici davranışı, firma teorisi, piyasa dengeleri.',
     42, 3, '2024-07-22', '2024-08-12', '2024-06-01', '2024-06-30',
     480.00, 40, 'Mikroekonomi ile denkdir.',
     'Temel matematik.'),

    (hku_id, sample_academician_id, 'Makroekonomi', 'EKO102',
     'Milli gelir, enflasyon, işsizlik, para ve maliye politikaları.',
     42, 3, '2024-07-15', '2024-08-10', '2024-06-01', '2024-06-30',
     500.00, 35, 'EKO102, İKT102 veya Makroekonomi dersleri ile denkdir.',
     'Mikroekonomi başarılı.'),
    
    (gantep_id, sample_academician_id, 'Makroiktisat', 'IKT102',
     'Ekonomik büyüme, para teorisi, uluslararası ekonomi.',
     42, 3, '2024-07-22', '2024-08-12', '2024-06-01', '2024-06-30',
     480.00, 40, 'Makroekonomi ile denkdir.',
     'Mikroekonomi başarılı.');

    RAISE NOTICE 'Gaziantep yaz okulu dersleri başarıyla eklendi!';
END $$;

SELECT 'Toplam ' || COUNT(*) || ' yaz okulu dersi eklendi!' as mesaj 
FROM summer_school_offerings;

