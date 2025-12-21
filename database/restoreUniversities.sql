-- Üniversiteleri Geri Yükleme
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- 1. Mevcut üniversiteleri kontrol et
SELECT * FROM universities ORDER BY id;

-- 2. Eğer yoksa veya silindiyse, üniversiteleri tekrar ekle

-- Önce mevcut üniversiteleri sil (varsa)
-- DELETE FROM universities WHERE id IN (1, 2, 3);

-- Gaziantep'teki 3 üniversiteyi ekle
INSERT INTO universities (id, name, city, type, website, description) 
VALUES 
(1, 'Gaziantep Üniversitesi', 'Gaziantep', 'devlet', 'https://www.gantep.edu.tr', 'Gaziantep''in köklü devlet üniversitesi'),
(2, 'Gaziantep İslam Bilim ve Teknoloji Üniversitesi', 'Gaziantep', 'devlet', 'https://www.gibtu.edu.tr', 'İslam medeniyetinin bilim ve teknoloji mirasını çağdaş eğitimle buluşturan üniversite'),
(3, 'Hasan Kalyoncu Üniversitesi', 'Gaziantep', 'vakif', 'https://www.hku.edu.tr', 'Gaziantep''in öncü vakıf üniversitesi')
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  type = EXCLUDED.type,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 3. Sequence'i düzelt
SELECT setval('universities_id_seq', (SELECT MAX(id) FROM universities));

-- 4. Üniversiteleri ve akademisyen/öğrenci sayılarını kontrol et
SELECT 
    u.id,
    u.name,
    u.city,
    u.type,
    COUNT(DISTINCT a.id) as academician_count,
    COUNT(DISTINCT CASE 
        WHEN f.id IS NOT NULL AND c.academician_id = a.id AND a.university_id = u.id 
        THEN s.id 
    END) as student_count
FROM universities u
LEFT JOIN academicians a ON u.id = a.university_id
LEFT JOIN courses c ON a.id = c.academician_id
LEFT JOIN favorites f ON c.id = f.course_id
LEFT JOIN students s ON f.student_id = s.id
GROUP BY u.id, u.name, u.city, u.type
ORDER BY u.id;

-- 5. Akademisyenlerin üniversite dağılımı
SELECT 
    u.name as university_name,
    COUNT(a.id) as academician_count
FROM universities u
LEFT JOIN academicians a ON u.id = a.university_id
GROUP BY u.name
ORDER BY academician_count DESC;

