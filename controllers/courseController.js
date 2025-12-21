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
        c.application_deadline,
        c.start_date,
        c.end_date,
        c.created_at,
        u.first_name || ' ' || u.last_name as academician_name,
        CASE 
          WHEN c.application_deadline >= CURRENT_DATE THEN true
          ELSE false
        END as is_active
      FROM courses c
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE c.application_deadline IS NULL OR c.application_deadline >= CURRENT_DATE
      ORDER BY c.created_at DESC
    `;

    res.json({
      success: true,
      courses: courses,
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

    // Sadece kendi üniversitesindeki ve kendine ait dersleri listele
    const courses = await sql`
      SELECT 
        id,
        course_name,
        course_code,
        description,
        category,
        university_count,
        student_count,
        application_deadline,
        start_date,
        end_date,
        created_at,
        CASE 
          WHEN application_deadline >= CURRENT_DATE THEN true
          ELSE false
        END as is_active
      FROM courses
      WHERE academician_id = ${academician[0].id}
        AND (university_id = ${academician[0].university_id} OR university_id IS NULL)
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      courses: courses,
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
    const { courseName, courseCode, description, category, academicianId, applicationDeadline, startDate, endDate } = req.body;

    if (!courseName || courseName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Ders adı gereklidir",
      });
    }

    let finalAcademicianId = null;
    let finalUniversityId = null;

    // Admin ise, academicianId parametresini kullanabilir veya null bırakabilir
    if (userType === 'admin') {
      if (academicianId) {
        // Belirtilen akademisyen ID'sini kontrol et
        const academician = await sql`SELECT id, university_id FROM academicians WHERE id = ${academicianId}`;
        if (academician.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Geçersiz akademisyen ID",
          });
        }
        finalAcademicianId = academicianId;
        finalUniversityId = academician[0].university_id;
      }
      // Admin için academician_id null olabilir (sistem dersi)
    } else {
      // Akademisyen ise, kendi ID'sini ve üniversitesini kullan
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
          message: "Ders eklemek için bir üniversiteye bağlı olmanız gerekir.",
        });
      }

      finalAcademicianId = academician[0].id;
      finalUniversityId = academician[0].university_id;
    }

    // Ders oluştur
    const newCourse = await sql`
      INSERT INTO courses (academician_id, course_name, course_code, description, category, university_id, application_deadline, start_date, end_date)
      VALUES (${finalAcademicianId}, ${courseName}, ${courseCode || null}, ${description || null}, ${category || null}, ${finalUniversityId}, ${applicationDeadline || null}, ${startDate || null}, ${endDate || null})
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

// Akademisyenin derslerini öğrencilerle birlikte listele
exports.getMyCoursesWithStudents = async (req, res) => {
  try {
    const userId = req.user.id;

    // Akademisyen ID'sini bul
    const academician = await sql`
      SELECT id, university_id FROM academicians WHERE user_id = ${userId}
    `;

    if (academician.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için akademisyen yetkisi gereklidir",
      });
    }

    // Akademisyenin derslerini getir
    const courses = await sql`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.university_count,
        c.student_count,
        c.application_deadline,
        c.start_date,
        c.end_date,
        c.created_at,
        CASE 
          WHEN c.application_deadline >= CURRENT_DATE THEN true
          ELSE false
        END as is_active
      FROM courses c
      WHERE c.academician_id = ${academician[0].id}
        AND (c.university_id = ${academician[0].university_id} OR c.university_id IS NULL)
      ORDER BY c.created_at DESC
    `;

    // Her ders için öğrencileri getir
    const coursesWithStudents = await Promise.all(
      courses.map(async (course) => {
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
          WHERE f.course_id = ${course.id}
          ORDER BY f.created_at DESC
        `;

        return {
          ...course,
          students: students,
          student_count: students.length,
        };
      })
    );

    res.json({
      success: true,
      courses: coursesWithStudents,
    });
  } catch (error) {
    console.error("Ders listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Dersler alınırken bir hata oluştu",
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
      // Akademisyen ise, sadece kendi üniversitesindeki kendi derslerini silebilir
      const academician = await sql`
        SELECT id, university_id FROM academicians WHERE user_id = ${userId}
      `;

      if (academician.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Bu işlem için akademisyen yetkisi gereklidir",
        });
      }

      // Dersin sahibi ve üniversite kontrolü
      const course = await sql`
        SELECT id FROM courses 
        WHERE id = ${courseId} 
          AND academician_id = ${academician[0].id}
          AND (university_id = ${academician[0].university_id} OR university_id IS NULL)
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

