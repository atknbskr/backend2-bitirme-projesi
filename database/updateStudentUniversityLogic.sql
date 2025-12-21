-- Öğrenci-Üniversite İlişkisi Güncelleme
-- Bu script öğrencilerin hangi üniversitenin dersini seçtiğini gösterir

-- 1. Öğrencilerin favori derslerine göre üniversite ilişkisini göster
SELECT 
    s.id as student_id,
    u_users.first_name || ' ' || u_users.last_name as student_name,
    s.student_number,
    uni.name as university_name,
    COUNT(DISTINCT f.course_id) as favorite_course_count
FROM students s
LEFT JOIN users u_users ON s.user_id = u_users.id
LEFT JOIN favorites f ON s.id = f.student_id
LEFT JOIN courses c ON f.course_id = c.id
LEFT JOIN academicians a ON c.academician_id = a.id
LEFT JOIN universities uni ON a.university_id = uni.id
WHERE uni.id IS NOT NULL
GROUP BY s.id, u_users.first_name, u_users.last_name, s.student_number, uni.name
ORDER BY s.id, favorite_course_count DESC;

-- 2. Toplam öğrenci sayısı (veritabanında)
SELECT COUNT(*) as total_students FROM students;

-- 3. Her üniversitenin öğrenci sayısı (favori derslere göre)
SELECT 
    uni.id,
    uni.name as university_name,
    COUNT(DISTINCT s.id) as student_count
FROM universities uni
LEFT JOIN academicians a ON uni.id = a.university_id
LEFT JOIN courses c ON a.id = c.academician_id
LEFT JOIN favorites f ON c.id = f.course_id
LEFT JOIN students s ON f.student_id = s.id
GROUP BY uni.id, uni.name
ORDER BY student_count DESC;

-- 4. Hiçbir üniversiteyle ilişkisi olmayan öğrenciler
SELECT 
    s.id,
    u.first_name || ' ' || u.last_name as student_name,
    s.student_number,
    COUNT(f.id) as total_favorites
FROM students s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN favorites f ON s.id = f.student_id
WHERE s.id NOT IN (
    SELECT DISTINCT s2.id
    FROM students s2
    LEFT JOIN favorites f2 ON s2.id = f2.student_id
    LEFT JOIN courses c ON f2.course_id = c.id
    LEFT JOIN academicians a ON c.academician_id = a.id
    WHERE a.university_id IS NOT NULL
)
GROUP BY s.id, u.first_name, u.last_name, s.student_number
ORDER BY s.id;

-- 5. Her üniversitenin akademisyen ve öğrenci sayısı (güncel mantık)
SELECT 
    u.id,
    u.name as university_name,
    u.city,
    u.type,
    COUNT(DISTINCT a.id) as academician_count,
    COUNT(DISTINCT student_courses.student_id) as student_count
FROM universities u
LEFT JOIN academicians a ON u.id = a.university_id
LEFT JOIN (
    -- Öğrenciler hangi üniversitenin dersini seçmişse o üniversiteye aittir
    SELECT DISTINCT 
        s.id as student_id,
        acad.university_id
    FROM students s
    LEFT JOIN favorites f ON s.id = f.student_id
    LEFT JOIN courses c ON f.course_id = c.id
    LEFT JOIN academicians acad ON c.academician_id = acad.id
    WHERE acad.university_id IS NOT NULL
    
    UNION
    
    -- Ya da yaz okulu kayıtlarından
    SELECT DISTINCT 
        s.id as student_id,
        acad.university_id
    FROM students s
    LEFT JOIN summer_registrations sr ON s.id = sr.student_id
    LEFT JOIN summer_offerings so ON sr.offering_id = so.id
    LEFT JOIN courses c ON so.course_id = c.id
    LEFT JOIN academicians acad ON c.academician_id = acad.id
    WHERE acad.university_id IS NOT NULL
) student_courses ON student_courses.university_id = u.id
GROUP BY u.id, u.name, u.city, u.type
ORDER BY u.name ASC;

