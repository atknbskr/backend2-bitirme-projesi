-- Üniversiteler Tablosu
CREATE TABLE IF NOT EXISTS universities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    city VARCHAR(100),
    type VARCHAR(20) DEFAULT 'devlet',
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Üniversiteler için indeks
CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_universities_city ON universities(city);

-- Varsayılan üniversiteler ekle
INSERT INTO universities (name, city, website, description) VALUES
    ('Hasan Kalyoncu Üniversitesi', 'Gaziantep', 'https://www.hku.edu.tr', 'Gaziantep''te bulunan vakıf üniversitesi'),
    ('Orta Doğu Teknik Üniversitesi', 'Ankara', 'https://www.metu.edu.tr', 'Türkiye''nin önde gelen teknik üniversitelerinden'),
    ('Boğaziçi Üniversitesi', 'İstanbul', 'https://www.bogazici.edu.tr', 'İstanbul''un prestijli üniversitesi'),
    ('İstanbul Teknik Üniversitesi', 'İstanbul', 'https://www.itu.edu.tr', 'Türkiye''nin en eski teknik üniversitesi'),
    ('Ankara Üniversitesi', 'Ankara', 'https://www.ankara.edu.tr', 'Türkiye Cumhuriyeti''nin ilk üniversitesi'),
    ('İstanbul Üniversitesi', 'İstanbul', 'https://www.istanbul.edu.tr', 'Osmanlı''dan günümüze köklü bir üniversite')
ON CONFLICT (name) DO NOTHING;

SELECT 'Üniversiteler tablosu başarıyla oluşturuldu!' as mesaj;

