const sql = require("../config/db");

// Tüm fakülteleri listele
exports.getAllFaculties = async (req, res) => {
  try {
    const { universityId } = req.query;
    
    let faculties;
    if (universityId) {
      faculties = await sql`
        SELECT 
          f.id,
          f.name,
          f.description,
          f.university_id,
          f.created_at,
          u.name as university_name,
          usr.first_name || ' ' || usr.last_name as academician_name
        FROM faculties f
        LEFT JOIN universities u ON f.university_id = u.id
        LEFT JOIN academicians a ON f.academician_id = a.id
        LEFT JOIN users usr ON a.user_id = usr.id
        WHERE f.university_id = ${universityId}
        ORDER BY f.created_at DESC
      `;
    } else {
      faculties = await sql`
        SELECT 
          f.id,
          f.name,
          f.description,
          f.university_id,
          f.created_at,
          u.name as university_name,
          usr.first_name || ' ' || usr.last_name as academician_name
        FROM faculties f
        LEFT JOIN universities u ON f.university_id = u.id
        LEFT JOIN academicians a ON f.academician_id = a.id
        LEFT JOIN users usr ON a.user_id = usr.id
        ORDER BY f.created_at DESC
      `;
    }

    res.json({
      success: true,
      faculties,
    });
  } catch (error) {
    console.error("Fakülte listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Fakülteler alınırken bir hata oluştu",
    });
  }
};

// Akademisyenin fakültelerini listele
exports.getMyFaculties = async (req, res) => {
  try {
    const userId = req.user.id;

    // Akademisyen ID'sini ve üniversitesini bul
    const academician = await sql`
      SELECT id, university_id FROM academicians WHERE user_id = ${userId}
    `;

    if (academician.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için akademisyen yetkisi gereklidir",
      });
    }

    // Sadece kendi üniversitesindeki ve kendine ait fakülteleri listele
    const faculties = await sql`
      SELECT 
        f.id,
        f.name,
        f.description,
        f.university_id,
        f.created_at,
        u.name as university_name
      FROM faculties f
      LEFT JOIN universities u ON f.university_id = u.id
      WHERE f.academician_id = ${academician[0].id}
        AND f.university_id = ${academician[0].university_id}
      ORDER BY f.created_at DESC
    `;

    res.json({
      success: true,
      faculties,
    });
  } catch (error) {
    console.error("Fakülte listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Fakülteler alınırken bir hata oluştu",
    });
  }
};

// Yeni fakülte ekle
exports.createFaculty = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { name, description, universityId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Fakülte adı gereklidir",
      });
    }

    let finalAcademicianId = null;
    let finalUniversityId = universityId;

    // Akademisyen ise, kendi ID'sini ve üniversitesini kullan
    if (userType === 'academician') {
      const academician = await sql`
        SELECT id, university_id FROM academicians WHERE user_id = ${userId}
      `;

      if (academician.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Bu işlem için akademisyen yetkisi gereklidir. Lütfen akademisyen olarak kayıt olun.",
        });
      }

      if (!academician[0].university_id) {
        return res.status(403).json({
          success: false,
          message: "Fakülte eklemek için bir üniversiteye bağlı olmanız gerekir.",
        });
      }

      finalAcademicianId = academician[0].id;
      finalUniversityId = academician[0].university_id;

      // Akademisyen sadece kendi üniversitesine fakülte ekleyebilir
      if (universityId && universityId !== academician[0].university_id) {
        return res.status(403).json({
          success: false,
          message: "Sadece kendi üniversitenize fakülte ekleyebilirsiniz.",
        });
      }
    } else if (userType === 'admin') {
      // Admin için universityId zorunlu
      if (!universityId) {
        return res.status(400).json({
          success: false,
          message: "Admin kullanıcılar için üniversite ID'si gereklidir",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz yok",
      });
    }

    // Üniversite var mı kontrol et
    const university = await sql`
      SELECT id FROM universities WHERE id = ${finalUniversityId}
    `;

    if (university.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz üniversite ID",
      });
    }

    // Fakülte oluştur
    const newFaculty = await sql`
      INSERT INTO faculties (name, description, university_id, academician_id)
      VALUES (${name}, ${description || null}, ${finalUniversityId}, ${finalAcademicianId})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Fakülte başarıyla eklendi",
      faculty: newFaculty[0],
    });
  } catch (error) {
    console.error("Fakülte ekleme hatası:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Fakülte eklenirken bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Fakülte sil
exports.deleteFaculty = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const facultyId = req.params.id;

    // Admin ise, tüm fakülteleri silebilir
    if (userType === 'admin') {
      const faculty = await sql`SELECT id FROM faculties WHERE id = ${facultyId}`;
      if (faculty.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Fakülte bulunamadı",
        });
      }
    } else if (userType === 'academician') {
      // Akademisyen ise, sadece kendi üniversitesindeki kendi fakültelerini silebilir
      const academician = await sql`
        SELECT id, university_id FROM academicians WHERE user_id = ${userId}
      `;

      if (academician.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Bu işlem için akademisyen yetkisi gereklidir",
        });
      }

      // Fakültenin sahibi ve üniversite kontrolü
      const faculty = await sql`
        SELECT id FROM faculties 
        WHERE id = ${facultyId} 
          AND academician_id = ${academician[0].id}
          AND university_id = ${academician[0].university_id}
      `;

      if (faculty.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Fakülte bulunamadı veya silme yetkiniz yok",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz yok",
      });
    }

    // Fakülteyi sil
    await sql`DELETE FROM faculties WHERE id = ${facultyId}`;

    res.json({
      success: true,
      message: "Fakülte başarıyla silindi",
    });
  } catch (error) {
    console.error("Fakülte silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Fakülte silinirken bir hata oluştu",
    });
  }
};
















