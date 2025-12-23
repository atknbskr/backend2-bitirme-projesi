const sql = require("../config/db");

// Öğrencinin aldığı dersleri listele
exports.getMyEnrolledCourses = async (req, res) => {
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

    // Öğrencinin derslerini getir
    const courses = await sql`
      SELECT 
        sc.id,
        sc.course_code,
        sc.course_name,
        sc.university_name,
        sc.credits,
        sc.enrollment_type,
        sc.status,
        sc.grade,
        sc.enrolled_at,
        sc.completed_at,
        so.start_date,
        so.end_date,
        so.price,
        so.udemy_link,
        sr.status as registration_status
      FROM student_courses sc
      LEFT JOIN summer_school_offerings so ON sc.summer_offering_id = so.id
      LEFT JOIN summer_school_registrations sr ON sc.registration_id = sr.id
      WHERE sc.student_id = ${student[0].id}
      ORDER BY sc.enrolled_at DESC
    `;

    res.json({
      success: true,
      courses: courses,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Dersler listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Dersler alınırken bir hata oluştu",
    });
  }
};

// Öğrencinin belirli bir dersini görüntüle
exports.getEnrolledCourse = async (req, res) => {
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

    // Ders detaylarını getir
    const course = await sql`
      SELECT 
        sc.*,
        so.start_date,
        so.end_date,
        so.price,
        so.description,
        sr.status as registration_status,
        sr.application_note
      FROM student_courses sc
      LEFT JOIN summer_school_offerings so ON sc.summer_offering_id = so.id
      LEFT JOIN summer_school_registrations sr ON sc.registration_id = sr.id
      WHERE sc.id = ${courseId} AND sc.student_id = ${student[0].id}
    `;

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    res.json({
      success: true,
      data: course[0],
    });
  } catch (error) {
    console.error("Ders detayı alma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ders detayı alınırken bir hata oluştu",
    });
  }
};

// Dersten çıkış yap
exports.withdrawFromCourse = async (req, res) => {
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

    // Dersi kontrol et
    const course = await sql`
      SELECT id, status, registration_id FROM student_courses
      WHERE id = ${courseId} AND student_id = ${student[0].id}
    `;

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    if (course[0].status === "withdrawn") {
      return res.status(400).json({
        success: false,
        message: "Bu dersten zaten çıkış yaptınız",
      });
    }

    // Dersten çıkış yap
    await sql`
      UPDATE student_courses
      SET status = 'withdrawn'
      WHERE id = ${courseId}
    `;

    // İlgili başvuruyu da iptal et
    if (course[0].registration_id) {
      await sql`
        UPDATE summer_school_registrations
        SET status = 'cancelled', status_updated_at = CURRENT_TIMESTAMP
        WHERE id = ${course[0].registration_id}
      `;
    }

    res.json({
      success: true,
      message: "Dersten başarıyla çıkış yaptınız",
    });
  } catch (error) {
    console.error("Dersten çıkış hatası:", error);
    res.status(500).json({
      success: false,
      message: "Dersten çıkış yapılırken bir hata oluştu",
    });
  }
};





