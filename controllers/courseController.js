const sql = require("../config/db");

// Tüm dersleri listele
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await sql`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.university_count,
        c.student_count,
        c.created_at,
        u.first_name || ' ' || u.last_name as academician_name
      FROM courses c
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Ders listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Dersler alınırken bir hata oluştu",
    });
  }
};

// Akademisyenin derslerini listele
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Akademisyen ID'sini bul
    const academician = await sql`
      SELECT id FROM academicians WHERE user_id = ${userId}
    `;

    if (academician.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için akademisyen yetkisi gereklidir",
      });
    }

    const courses = await sql`
      SELECT 
        id,
        course_name,
        course_code,
        description,
        category,
        university_count,
        student_count,
        created_at
      FROM courses
      WHERE academician_id = ${academician[0].id}
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Ders listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Dersler alınırken bir hata oluştu",
    });
  }
};

// Yeni ders ekle
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { courseName, courseCode, description, category, academicianId } = req.body;

    if (!courseName || courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Ders adı gereklidir",
      });
    }

    let finalAcademicianId = null;

    // Admin ise, academicianId parametresini kullanabilir veya null bırakabilir
    if (userType === 'admin') {
      if (academicianId) {
        // Belirtilen akademisyen ID'sini kontrol et
        const academician = await sql`SELECT id FROM academicians WHERE id = ${academicianId}`;
        if (academician.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Geçersiz akademisyen ID",
          });
        }
        finalAcademicianId = academicianId;
      }
      // Admin için academician_id null olabilir (sistem dersi)
    } else {
      // Akademisyen ise, kendi ID'sini kullan
      const academician = await sql`
        SELECT id FROM academicians WHERE user_id = ${userId}
      `;

      if (academician.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Bu işlem için akademisyen yetkisi gereklidir. Lütfen akademisyen olarak kayıt olun.",
        });
      }
      finalAcademicianId = academician[0].id;
    }

    // Ders oluştur
    const newCourse = await sql`
      INSERT INTO courses (academician_id, course_name, course_code, description, category)
      VALUES (${finalAcademicianId}, ${courseName}, ${courseCode || null}, ${description || null}, ${category || null})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Ders başarıyla eklendi",
      course: newCourse[0],
    });
  } catch (error) {
    console.error("Ders ekleme hatası:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Ders eklenirken bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Derse kayıtlı öğrencileri getir
exports.getCourseStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    // Akademisyen ID'sini bul
    const academician = await sql`
      SELECT id FROM academicians WHERE user_id = ${userId}
    `;

    if (academician.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için akademisyen yetkisi gereklidir",
      });
    }

    // Dersin akademisyene ait olup olmadığını kontrol et
    const course = await sql`
      SELECT id, course_name FROM courses 
      WHERE id = ${courseId} AND academician_id = ${academician[0].id}
    `;

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı veya erişim yetkiniz yok",
      });
    }

    // Derse kayıtlı öğrencileri getir
    const students = await sql`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        s.student_number,
        f.created_at as enrolled_at
      FROM favorites f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.course_id = ${courseId}
      ORDER BY f.created_at DESC
    `;

    res.json({
      success: true,
      course: course[0],
      students,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("Öğrenci listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Öğrenciler alınırken bir hata oluştu",
    });
  }
};

// Ders sil
exports.deleteCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const courseId = req.params.id;

    // Admin ise, tüm dersleri silebilir
    if (userType === 'admin') {
      const course = await sql`SELECT id FROM courses WHERE id = ${courseId}`;
      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Ders bulunamadı",
        });
      }
    } else {
      // Akademisyen ise, sadece kendi derslerini silebilir
      const academician = await sql`
        SELECT id FROM academicians WHERE user_id = ${userId}
      `;

      if (academician.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Bu işlem için akademisyen yetkisi gereklidir",
        });
      }

      // Dersin sahibi kontrolü
      const course = await sql`
        SELECT id FROM courses 
        WHERE id = ${courseId} AND academician_id = ${academician[0].id}
      `;

      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Ders bulunamadı veya silme yetkiniz yok",
        });
      }
    }

    // Dersi sil
    await sql`DELETE FROM courses WHERE id = ${courseId}`;

    res.json({
      success: true,
      message: "Ders başarıyla silindi",
    });
  } catch (error) {
    console.error("Ders silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ders silinirken bir hata oluştu",
    });
  }
};

