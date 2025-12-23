const sql = require("../config/db");

// Öğrenci: Derse başvuru yap
exports.applyToCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    const { applicationNote } = req.body;
    
    // applicationNote boş string ise null yap
    const finalApplicationNote = applicationNote && applicationNote.trim() ? applicationNote.trim() : null;

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

    // Ders var mı ve aktif mi kontrol et
    const course = await sql`
      SELECT 
        id,
        course_name,
        application_deadline,
        academician_id
      FROM courses
      WHERE id = ${courseId}
    `;

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    // Başvuru tarihi geçmiş mi?
    if (course[0].application_deadline) {
      const deadline = new Date(course[0].application_deadline);
      const now = new Date();
      if (now > deadline) {
        return res.status(400).json({
          success: false,
          message: "Başvuru süresi sona ermiş",
        });
      }
    }

    // Aynı derse daha önce başvurmuş mu?
    const existingApplication = await sql`
      SELECT id, status FROM course_registrations
      WHERE student_id = ${student[0].id} AND course_id = ${courseId}
    `;

    if (existingApplication.length > 0) {
      const statusMap = {
        'pending': 'beklemede',
        'approved': 'onaylanmış',
        'rejected': 'reddedilmiş',
        'cancelled': 'iptal edilmiş'
      };
      return res.status(400).json({
        success: false,
        message: `Bu derse zaten başvurdunuz. Durum: ${statusMap[existingApplication[0].status] || existingApplication[0].status}`,
        existingStatus: existingApplication[0].status,
      });
    }

    // Başvuru oluştur
    const newApplication = await sql`
      INSERT INTO course_registrations (
        course_id,
        student_id,
        application_note,
        status
      )
      VALUES (
        ${courseId},
        ${student[0].id},
        ${finalApplicationNote},
        'pending'
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Başvurunuz başarıyla alındı",
      data: newApplication[0],
    });
  } catch (error) {
    console.error("Başvuru oluşturma hatası:", error);
    console.error("Hata detayı:", error.message);
    console.error("Hata stack:", error.stack);
    
    // Veritabanı hatası kontrolü
    let errorMessage = "Başvuru oluşturulurken bir hata oluştu";
    if (error.message && error.message.includes("does not exist")) {
      errorMessage = "Veritabanı hatası: course_registrations tablosu bulunamadı. Lütfen veritabanı tablosunu oluşturun.";
    } else if (error.message) {
      errorMessage = `Hata: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Öğrenci: Kendi başvurularını listele
exports.getMyApplications = async (req, res) => {
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

    const applications = await sql`
      SELECT 
        cr.id,
        cr.status,
        cr.application_note,
        cr.rejection_reason,
        cr.application_date,
        cr.status_updated_at,
        c.id as course_id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.application_deadline,
        c.start_date,
        c.end_date,
        u.first_name || ' ' || u.last_name as academician_name
      FROM course_registrations cr
      JOIN courses c ON cr.course_id = c.id
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE cr.student_id = ${student[0].id}
      ORDER BY cr.application_date DESC
    `;

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Başvurular listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvurular alınırken bir hata oluştu",
    });
  }
};

// Akademisyen: Bir derse yapılan başvuruları görüntüle
exports.getCourseApplications = async (req, res) => {
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

    // Başvuruları getir
    const applications = await sql`
      SELECT 
        cr.id,
        cr.status,
        cr.application_note,
        cr.rejection_reason,
        cr.application_date,
        cr.status_updated_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        s.student_number
      FROM course_registrations cr
      JOIN students s ON cr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE cr.course_id = ${courseId}
      ORDER BY cr.application_date DESC
    `;

    res.json({
      success: true,
      course: course[0],
      data: applications,
      totalApplications: applications.length,
    });
  } catch (error) {
    console.error("Başvurular listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvurular alınırken bir hata oluştu",
    });
  }
};

// Akademisyen: Tüm derslerine yapılan başvuruları görüntüle
exports.getMyCoursesApplications = async (req, res) => {
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

    // Akademisyenin derslerini getir
    const courses = await sql`
      SELECT 
        id,
        course_name,
        course_code
      FROM courses
      WHERE academician_id = ${academician[0].id}
      ORDER BY course_name
    `;

    // Her ders için başvuruları getir
    const coursesWithApplications = await Promise.all(
      courses.map(async (course) => {
        const applications = await sql`
          SELECT 
            cr.id,
            cr.status,
            cr.application_note,
            cr.rejection_reason,
            cr.application_date,
            cr.status_updated_at,
            u.id as user_id,
            u.first_name,
            u.last_name,
            u.email,
            s.student_number
          FROM course_registrations cr
          JOIN students s ON cr.student_id = s.id
          JOIN users u ON s.user_id = u.id
          WHERE cr.course_id = ${course.id}
          ORDER BY cr.application_date DESC
        `;

        return {
          ...course,
          applications: applications,
          totalApplications: applications.length,
          pendingCount: applications.filter(a => a.status === 'pending').length,
          approvedCount: applications.filter(a => a.status === 'approved').length,
          rejectedCount: applications.filter(a => a.status === 'rejected').length,
        };
      })
    );

    res.json({
      success: true,
      courses: coursesWithApplications,
    });
  } catch (error) {
    console.error("Başvurular listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvurular alınırken bir hata oluştu",
    });
  }
};

// Akademisyen: Başvuru durumunu güncelle (onayla/reddet)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;
    const { status, rejectionReason } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Geçerli bir durum belirtilmelidir (approved veya rejected)",
      });
    }

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

    // Başvurunun akademisyenin dersine ait olup olmadığını kontrol et
    const application = await sql`
      SELECT cr.id, cr.status, cr.course_id
      FROM course_registrations cr
      JOIN courses c ON cr.course_id = c.id
      WHERE cr.id = ${applicationId} AND c.academician_id = ${academician[0].id}
    `;

    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Başvuru bulunamadı veya erişim yetkiniz yok",
      });
    }

    if (application[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Sadece beklemedeki başvurular güncellenebilir",
      });
    }

    // Başvuru durumunu güncelle
    const updated = await sql`
      UPDATE course_registrations
      SET 
        status = ${status},
        rejection_reason = ${status === "rejected" ? rejectionReason || null : null},
        status_updated_at = CURRENT_TIMESTAMP,
        status_updated_by = ${userId}
      WHERE id = ${applicationId}
      RETURNING *
    `;

    res.json({
      success: true,
      message: status === "approved" ? "Başvuru onaylandı" : "Başvuru reddedildi",
      data: updated[0],
    });
  } catch (error) {
    console.error("Başvuru durumu güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvuru durumu güncellenirken bir hata oluştu",
    });
  }
};

// Öğrenci: Başvuruyu kontrol et (derse başvurmuş mu?)
exports.checkApplication = async (req, res) => {
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

    const application = await sql`
      SELECT id, status FROM course_registrations
      WHERE student_id = ${student[0].id} AND course_id = ${courseId}
    `;

    res.json({
      success: true,
      hasApplication: application.length > 0,
      application: application.length > 0 ? application[0] : null,
    });
  } catch (error) {
    console.error("Başvuru kontrol hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvuru kontrol edilirken bir hata oluştu",
    });
  }
};

