-- Yaz Okulu Sistemi Tabloları
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

-- 1. Öğrencilerin Başarısız Oldukları Dersler
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

-- 2. Yaz Okulu Teklifleri
CREATE TABLE IF NOT EXISTS summer_school_offerings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    university_id INTEGER NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
    academician_id INTEGER REFERENCES academicians(id) ON DELETE CASCADE,
    
    -- Ders Bilgileri
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    description TEXT,
    course_hours INTEGER,
    credits INTEGER,
    
    -- Tarih Bilgileri
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    application_start_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    
    -- Kontenjan ve Ücret
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    quota INTEGER NOT NULL DEFAULT 30,
    current_registrations INTEGER NOT NULL DEFAULT 0,
    
    -- Ek Bilgiler
    equivalency_info TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_date > start_date),
    CHECK (application_deadline <= start_date),
    CHECK (quota > 0),
    CHECK (current_registrations >= 0),
    CHECK (current_registrations <= quota)
);

-- 3. Yaz Okulu Başvuruları
CREATE TABLE IF NOT EXISTS summer_school_registrations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    offering_id INTEGER NOT NULL REFERENCES summer_school_offerings(id) ON DELETE CASCADE,
    failed_course_id INTEGER REFERENCES student_failed_courses(id) ON DELETE SET NULL,
    
    -- Başvuru Durumu
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Başvuru Notları
    application_note TEXT,
    rejection_reason TEXT,
    
    -- Tarihler
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_updated_at TIMESTAMP,
    status_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Bir öğrenci aynı teklife birden fazla başvuru yapamaz
    UNIQUE(student_id, offering_id)
);

-- 4. Courses tablosuna faculty_id ekleme (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'faculty_id'
    ) THEN
        ALTER TABLE courses ADD COLUMN faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL;
    END IF;
END $$;

-- İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_student_failed_courses_student_id ON student_failed_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_failed_courses_course_code ON student_failed_courses(course_code);

CREATE INDEX IF NOT EXISTS idx_summer_offerings_university_id ON summer_school_offerings(university_id);
CREATE INDEX IF NOT EXISTS idx_summer_offerings_faculty_id ON summer_school_offerings(faculty_id);
CREATE INDEX IF NOT EXISTS idx_summer_offerings_academician_id ON summer_school_offerings(academician_id);
CREATE INDEX IF NOT EXISTS idx_summer_offerings_course_code ON summer_school_offerings(course_code);
CREATE INDEX IF NOT EXISTS idx_summer_offerings_dates ON summer_school_offerings(application_deadline, start_date);
CREATE INDEX IF NOT EXISTS idx_summer_offerings_price ON summer_school_offerings(price);
CREATE INDEX IF NOT EXISTS idx_summer_offerings_active ON summer_school_offerings(is_active);

CREATE INDEX IF NOT EXISTS idx_summer_registrations_student_id ON summer_school_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_summer_registrations_offering_id ON summer_school_registrations(offering_id);
CREATE INDEX IF NOT EXISTS idx_summer_registrations_status ON summer_school_registrations(status);

SELECT 'Yaz okulu tabloları başarıyla oluşturuldu!' as mesaj;

