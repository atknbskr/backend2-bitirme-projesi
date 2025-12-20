const sql = require("../config/db");

// Öğrencinin favorilerini listele
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

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

    const favorites = await sql`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.university_count,
        c.student_count,
        f.created_at as favorited_at,
        u.first_name || ' ' || u.last_name as academician_name
      FROM favorites f
      JOIN courses c ON f.course_id = c.id
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE f.student_id = ${student[0].id}
      ORDER BY f.created_at DESC
    `;

    res.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error("Favori listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Favoriler alınırken bir hata oluştu",
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
      SELECT id FROM courses WHERE id = ${courseId}
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

    // Favoriye ekle
    await sql`
      INSERT INTO favorites (student_id, course_id)
      VALUES (${student[0].id}, ${courseId})
    `;

    // Öğrenci sayısını güncelle
    await sql`
      UPDATE courses 
      SET student_count = student_count + 1
      WHERE id = ${courseId}
    `;

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

    // Öğrenci sayısını güncelle
    await sql`
      UPDATE courses 
      SET student_count = GREATEST(student_count - 1, 0)
      WHERE id = ${courseId}
    `;

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



