const sql = require("../config/db");

// Tüm duyuruları getir (filtrelenmiş)
exports.getAnnouncements = async (req, res) => {
  try {
    const { targetAudience } = req.query;

    let announcements;
    
    if (targetAudience) {
      // Belirli bir hedef kitle için duyuruları getir
      announcements = await sql`
        SELECT a.*, u.first_name, u.last_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.is_active = true 
          AND (a.target_audience = ${targetAudience} OR a.target_audience = 'all')
        ORDER BY a.priority DESC, a.created_at DESC
      `;
    } else {
      // Tüm aktif duyuruları getir
      announcements = await sql`
        SELECT a.*, u.first_name, u.last_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.is_active = true
        ORDER BY a.priority DESC, a.created_at DESC
      `;
    }

    res.json({
      success: true,
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        targetAudience: a.target_audience,
        priority: a.priority,
        isActive: a.is_active,
        createdBy: a.first_name && a.last_name 
          ? `${a.first_name} ${a.last_name}` 
          : 'Sistem',
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
    });
  } catch (error) {
    console.error("Duyuru getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Duyurular alınırken hata oluştu",
    });
  }
};

// Tüm duyuruları getir (Admin için)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await sql`
      SELECT a.*, u.first_name, u.last_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `;

    res.json({
      success: true,
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        targetAudience: a.target_audience,
        priority: a.priority,
        isActive: a.is_active,
        createdBy: a.first_name && a.last_name 
          ? `${a.first_name} ${a.last_name}` 
          : 'Sistem',
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
    });
  } catch (error) {
    console.error("Duyuru getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Duyurular alınırken hata oluştu",
    });
  }
};

// Yeni duyuru oluştur
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, targetAudience, priority } = req.body;
    const userId = req.user.id;

    // Validasyon
    if (!title || !content || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Başlık, içerik ve hedef kitle zorunludur",
      });
    }

    const newAnnouncement = await sql`
      INSERT INTO announcements (title, content, target_audience, priority, created_by)
      VALUES (${title}, ${content}, ${targetAudience}, ${priority || 1}, ${userId})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Duyuru başarıyla oluşturuldu",
      announcement: {
        id: newAnnouncement[0].id,
        title: newAnnouncement[0].title,
        content: newAnnouncement[0].content,
        targetAudience: newAnnouncement[0].target_audience,
        priority: newAnnouncement[0].priority,
        isActive: newAnnouncement[0].is_active,
      },
    });
  } catch (error) {
    console.error("Duyuru oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Duyuru oluşturulurken hata oluştu",
    });
  }
};

// Duyuru güncelle
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, targetAudience, priority, isActive } = req.body;

    const updated = await sql`
      UPDATE announcements
      SET title = ${title},
          content = ${content},
          target_audience = ${targetAudience},
          priority = ${priority || 1},
          is_active = ${isActive !== undefined ? isActive : true},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Duyuru bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Duyuru başarıyla güncellendi",
      announcement: {
        id: updated[0].id,
        title: updated[0].title,
        content: updated[0].content,
        targetAudience: updated[0].target_audience,
        priority: updated[0].priority,
        isActive: updated[0].is_active,
      },
    });
  } catch (error) {
    console.error("Duyuru güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Duyuru güncellenirken hata oluştu",
    });
  }
};

// Duyuru sil
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await sql`
      DELETE FROM announcements
      WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Duyuru bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Duyuru başarıyla silindi",
    });
  } catch (error) {
    console.error("Duyuru silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Duyuru silinirken hata oluştu",
    });
  }
};

