-- Fakülteler Tablosu Oluştur
CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    academician_id INTEGER REFERENCES academicians(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_faculties_university_id ON faculties(university_id);
CREATE INDEX IF NOT EXISTS idx_faculties_academician_id ON faculties(academician_id);

-- Tabloların oluşturulduğunu kontrol et
SELECT 'Fakülteler tablosu başarıyla oluşturuldu!' as mesaj;


