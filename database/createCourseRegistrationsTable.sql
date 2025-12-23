-- Ders Başvuruları Tablosu
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

CREATE TABLE IF NOT EXISTS course_registrations (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Başvuru Durumu
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Başvuru Notları
    application_note TEXT,
    rejection_reason TEXT,
    
    -- Tarihler
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_updated_at TIMESTAMP,
    status_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Bir öğrenci aynı derse birden fazla başvuru yapamaz
    UNIQUE(course_id, student_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_course_registrations_course_id ON course_registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_registrations_student_id ON course_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_course_registrations_status ON course_registrations(status);
CREATE INDEX IF NOT EXISTS idx_course_registrations_application_date ON course_registrations(application_date);

