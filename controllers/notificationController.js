const sql = require("../config/db");

// Tablo var mı kontrol et ve yoksa oluştur
async function ensureTableExists() {
  try {
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      )
    `;
    
    if (!tableCheck[0]?.exists) {
      console.log('notifications tablosu bulunamadı, oluşturuluyor...');
      
      await sql`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          related_id INTEGER,
          related_type VARCHAR(50),
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP
        )
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)
      `;
      
      console.log('✅ notifications tablosu başarıyla oluşturuldu');
    }
  } catch (error) {
    console.error('Tablo oluşturma hatası:', error);
    throw error;
  }
}

// Bildirim oluştur
exports.createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    await ensureTableExists();
    
    const notification = await sql`
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_id,
        related_type
      )
      VALUES (
        ${userId},
        ${type},
        ${title},
        ${message},
        ${relatedId},
        ${relatedType}
      )
      RETURNING *
    `;
    
    return notification[0];
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    throw error;
  }
};

// Kullanıcının bildirimlerini getir
exports.getMyNotifications = async (req, res) => {
  try {
    await ensureTableExists();
    
    const userId = req.user.id;
    const { unreadOnly } = req.query;
    
    let notifications;
    if (unreadOnly === 'true') {
      notifications = await sql`
        SELECT 
          id,
          type,
          title,
          message,
          related_id,
          related_type,
          is_read,
          created_at,
          read_at
        FROM notifications
        WHERE user_id = ${userId}
          AND is_read = false
        ORDER BY created_at DESC
      `;
    } else {
      notifications = await sql`
        SELECT 
          id,
          type,
          title,
          message,
          related_id,
          related_type,
          is_read,
          created_at,
          read_at
        FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }
    
    // Okunmamış bildirim sayısını ayrı bir sorgu ile al
    const unreadResult = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;
    const unreadCount = parseInt(unreadResult[0]?.count || 0);
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error("Bildirimler getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler alınırken bir hata oluştu",
    });
  }
};

// Bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    await ensureTableExists();
    
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Bildirimin kullanıcıya ait olduğunu kontrol et
    const notification = await sql`
      SELECT id FROM notifications
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;
    
    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bildirim bulunamadı",
      });
    }
    
    await sql`
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;
    
    res.json({
      success: true,
      message: "Bildirim okundu olarak işaretlendi",
    });
  } catch (error) {
    console.error("Bildirim güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Bildirim güncellenirken bir hata oluştu",
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
exports.markAllAsRead = async (req, res) => {
  try {
    await ensureTableExists();
    
    const userId = req.user.id;
    
    await sql`
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND is_read = false
    `;
    
    res.json({
      success: true,
      message: "Tüm bildirimler okundu olarak işaretlendi",
    });
  } catch (error) {
    console.error("Bildirimler güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Bildirimler güncellenirken bir hata oluştu",
    });
  }
};

// Okunmamış bildirim sayısını getir
exports.getUnreadCount = async (req, res) => {
  try {
    await ensureTableExists();
    
    const userId = req.user.id;
    
    const result = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;
    
    res.json({
      success: true,
      count: parseInt(result[0].count) || 0,
    });
  } catch (error) {
    console.error("Okunmamış bildirim sayısı getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Okunmamış bildirim sayısı alınırken bir hata oluştu",
    });
  }
};

