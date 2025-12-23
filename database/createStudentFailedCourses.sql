-- student_failed_courses tablosunu oluştur
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın veya Node.js scripti ile çalıştırın

CREATE TABLE IF NOT EXISTS student_failed_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    semester VARCHAR(50),
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_code, academic_year)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_student_failed_courses_student_id 
ON student_failed_courses(student_id);

CREATE INDEX IF NOT EXISTS idx_student_failed_courses_course_code 
ON student_failed_courses(course_code);

SELECT 'student_failed_courses tablosu başarıyla oluşturuldu!' as mesaj;








