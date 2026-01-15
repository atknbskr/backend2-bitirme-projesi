-- Bildirimler Tablosu
-- Bu SQL'i Neon Dashboard > SQL Editor'de çalıştırın

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'application_approved', 'application_rejected', 'new_application', vb.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INTEGER, -- İlgili kayıt ID'si (ör: registration_id, offering_id)
    related_type VARCHAR(50), -- İlgili kayıt tipi (ör: 'registration', 'offering')
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

SELECT 'Bildirimler tablosu başarıyla oluşturuldu!' as mesaj;











