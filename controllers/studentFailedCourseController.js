const sql = require("../config/db");

// Öğrencinin başarısız derslerini listele
exports.getMyFailedCourses = async (req, res) => {
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

    const failedCourses = await sql`
      SELECT 
        id,
        course_name,
        course_code,
        semester,
        academic_year,
        created_at
      FROM student_failed_courses
      WHERE student_id = ${student[0].id}
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: failedCourses,
    });
  } catch (error) {
    console.error("Başarısız dersler listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başarısız dersler alınırken bir hata oluştu",
    });
  }
};

// Yeni başarısız ders ekle
exports.addFailedCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseName, courseCode, semester, academicYear } = req.body;

    if (!courseName || courseName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Ders adı gereklidir",
      });
    }

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

    // Aynı ders zaten ekli mi kontrol et
    if (courseCode && academicYear) {
      const existing = await sql`
        SELECT id FROM student_failed_courses
        WHERE student_id = ${student[0].id}
          AND course_code = ${courseCode}
          AND academic_year = ${academicYear}
      `;

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Bu ders zaten ekli",
        });
      }
    }

    // Başarısız dersi ekle
    const newFailedCourse = await sql`
      INSERT INTO student_failed_courses (
        student_id, 
        course_name, 
        course_code, 
        semester, 
        academic_year
      )
      VALUES (
        ${student[0].id}, 
        ${courseName}, 
        ${courseCode || null}, 
        ${semester || null}, 
        ${academicYear || null}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Başarısız ders başarıyla eklendi",
      data: newFailedCourse[0],
    });
  } catch (error) {
    console.error("Başarısız ders ekleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başarısız ders eklenirken bir hata oluştu",
    });
  }
};

// Başarısız ders sil
exports.deleteFailedCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const failedCourseId = req.params.id;

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

    // Dersin öğrenciye ait olup olmadığını kontrol et
    const failedCourse = await sql`
      SELECT id FROM student_failed_courses
      WHERE id = ${failedCourseId} AND student_id = ${student[0].id}
    `;

    if (failedCourse.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Başarısız ders bulunamadı veya silme yetkiniz yok",
      });
    }

    // Başarısız dersi sil
    await sql`DELETE FROM student_failed_courses WHERE id = ${failedCourseId}`;

    res.json({
      success: true,
      message: "Başarısız ders başarıyla silindi",
    });
  } catch (error) {
    console.error("Başarısız ders silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başarısız ders silinirken bir hata oluştu",
    });
  }
};

