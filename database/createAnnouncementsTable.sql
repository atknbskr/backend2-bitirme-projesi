-- Duyurular Tablosu
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(50) NOT NULL CHECK (target_audience IN ('student', 'academician', 'all')),
    priority INTEGER DEFAULT 1, -- 1: Normal, 2: Önemli, 3: Acil
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeks
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);

-- Örnek duyurular ekle
INSERT INTO announcements (title, content, target_audience, priority, created_by) 
VALUES 
('ÖĞRENCİLERİN DİKKATİNE', 'Kişisel bilgilerinizin güvenliği için Öğrenci Bilgi Sistemi şifrenizi güncellemeniz önemlidir.', 'student', 2, NULL),
('YAZ DÖNEMİ KAYIT', 'Yaz dönemi ders kayıtları 15 Haziran tarihinde başlayacaktır.', 'all', 1, NULL);



