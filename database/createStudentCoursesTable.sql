-- Öğrencilerin Aldığı Dersler Tablosu
-- Bu tablo öğrencilerin kayıtlı olduğu dersleri tutar
-- Yaz okulu başvurusu onaylandığında otomatik olarak buraya eklenir

CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    summer_offering_id INTEGER REFERENCES summer_school_offerings(id) ON DELETE SET NULL,
    registration_id INTEGER REFERENCES summer_school_registrations(id) ON DELETE CASCADE,
    
    -- Ders Bilgileri (snapshot - değişmemesi için)
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    university_name VARCHAR(255),
    credits INTEGER,
    
    -- Kayıt Bilgileri
    enrollment_type VARCHAR(20) NOT NULL DEFAULT 'summer_school' CHECK (enrollment_type IN ('summer_school', 'regular', 'transfer')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'withdrawn')),
    grade VARCHAR(5),
    
    -- Tarihler
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Bir öğrenci aynı dersi birden fazla alamaz (aktif olarak)
    UNIQUE(student_id, course_code)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_status ON student_courses(status);
CREATE INDEX IF NOT EXISTS idx_student_courses_enrollment_type ON student_courses(enrollment_type);

SELECT 'student_courses tablosu başarıyla oluşturuldu!' as mesaj;

