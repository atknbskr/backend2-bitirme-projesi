const sql = require("../config/db");

// Öğrencinin favorilerini listele
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Favori listesi istendi, user_id:', userId);

    // Öğrenci ID'sini bul
    const student = await sql`
      SELECT id FROM students WHERE user_id = ${userId}
    `;

    if (student.length === 0) {
      console.log('Öğrenci bulunamadı, user_id:', userId);
      return res.status(403).json({
        success: false,
        message: "Bu işlem için öğrenci yetkisi gereklidir",
      });
    }

    console.log('Öğrenci bulundu, student_id:', student[0].id);

    const favorites = await sql`
      SELECT 
        f.id as favorite_id,
        so.id,
        so.course_name,
        so.course_code,
        so.description,
        NULL as category,
        0 as university_count,
        COALESCE(so.current_registrations, 0) as student_count,
        so.application_deadline,
        so.start_date,
        so.end_date,
        so.created_at,
        f.created_at as favorited_at,
        COALESCE(u.first_name || ' ' || u.last_name, 'Belirtilmemiş') as academician_name,
        so.price,
        so.credits,
        so.quota,
        so.is_active
      FROM favorites f
      JOIN summer_school_offerings so ON f.course_id = so.id
      LEFT JOIN academicians a ON so.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE f.student_id = ${student[0].id}
      ORDER BY f.created_at DESC
    `;

    console.log(`${favorites.length} favori ders bulundu`);

    res.json({
      success: true,
      favorites: favorites,
      totalFavorites: favorites.length,
    });
  } catch (error) {
    console.error("Favori listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Favoriler alınırken bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Favoriye ekle
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;

    // Öğrenci ID'sini bul
    const student = await sql`
      SELECT id FROM students WHERE user_id = ${userId}
    `;

    if (student.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için öğrenci yetkisi gereklidir",
      });
    }

    // Dersin var olup olmadığını kontrol et
    const course = await sql`
      SELECT id FROM summer_school_offerings WHERE id = ${courseId}
    `;

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    // Zaten favoride mi kontrol et
    const existingFavorite = await sql`
      SELECT id FROM favorites 
      WHERE student_id = ${student[0].id} AND course_id = ${courseId}
    `;

    if (existingFavorite.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu ders zaten favorilerinizde",
      });
    }

    // Favoriye ekle (status: pending olarak)
    await sql`
      INSERT INTO favorites (student_id, course_id, status)
      VALUES (${student[0].id}, ${courseId}, 'pending')
    `;

    // Öğrenci sayısını güncelleme - sadece onaylandığında artırılacak

    res.status(201).json({
      success: true,
      message: "Ders favorilere eklendi",
    });
  } catch (error) {
    console.error("Favori ekleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Favori eklenirken bir hata oluştu",
    });
  }
};

// Favoriden çıkar
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    // Öğrenci ID'sini bul
    const student = await sql`
      SELECT id FROM students WHERE user_id = ${userId}
    `;

    if (student.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için öğrenci yetkisi gereklidir",
      });
    }

    // Favoriyi sil
    const deleted = await sql`
      DELETE FROM favorites 
      WHERE student_id = ${student[0].id} AND course_id = ${courseId}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Favori bulunamadı",
      });
    }

    // Öğrenci sayısını güncelle (summer_school_offerings'de current_registrations kullanılıyor)
    // Favori çıkarıldığında current_registrations azaltılmaz çünkü bu sadece onaylanmış başvurular için

    res.json({
      success: true,
      message: "Ders favorilerden çıkarıldı",
    });
  } catch (error) {
    console.error("Favori çıkarma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Favori çıkarılırken bir hata oluştu",
    });
  }
};

// Favori durumunu kontrol et
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    // Öğrenci ID'sini bul
    const student = await sql`
      SELECT id FROM students WHERE user_id = ${userId}
    `;

    if (student.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için öğrenci yetkisi gereklidir",
      });
    }

    const favorite = await sql`
      SELECT id FROM favorites 
      WHERE student_id = ${student[0].id} AND course_id = ${courseId}
    `;

    res.json({
      success: true,
      isFavorite: favorite.length > 0,
    });
  } catch (error) {
    console.error("Favori kontrol hatası:", error);
    res.status(500).json({
      success: false,
      message: "Favori kontrol edilirken bir hata oluştu",
    });
  }
};



