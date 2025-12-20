-- Campus Summer Veritabanı Tablolarını Oluştur
-- Bu dosyayı veritabanınızda çalıştırın

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'academician', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Öğrenciler Tablosu
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_number VARCHAR(20) UNIQUE NOT NULL
);

-- Akademisyenler Tablosu
CREATE TABLE IF NOT EXISTS academicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL
);

-- Adminler Tablosu
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    admin_code VARCHAR(50) UNIQUE NOT NULL,
    is_super_admin BOOLEAN DEFAULT FALSE
);

-- Dersler Tablosu (ÖNEMLİ: Bu tablo olmadan ders eklenemez!)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    academician_id INTEGER REFERENCES academicians(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    description TEXT,
    category VARCHAR(100),
    university_count INTEGER DEFAULT 0,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favoriler Tablosu
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_student_number ON students(student_number);
CREATE INDEX IF NOT EXISTS idx_academicians_username ON academicians(username);
CREATE INDEX IF NOT EXISTS idx_admins_admin_code ON admins(admin_code);
CREATE INDEX IF NOT EXISTS idx_courses_academician_id ON courses(academician_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_favorites_student_id ON favorites(student_id);
CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);

-- Tabloların oluşturulduğunu kontrol et
SELECT 'Tablolar başarıyla oluşturuldu!' as mesaj;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'students', 'academicians', 'admins', 'courses', 'favorites');


