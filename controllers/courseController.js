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
        c.academician_id,
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

    // Derse kayıtlı öğrencileri getir (status bilgisi ile)
    const students = await sql`
      SELECT 
        f.id as favorite_id,
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        s.student_number,
        f.status,
        f.created_at as enrolled_at
      FROM favorites f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.course_id = ${courseId}
      ORDER BY 
        CASE f.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
        END,
        f.created_at DESC
    `;

    res.json({
      success: true,
      course: course[0],
      students,
      totalStudents: students.length,
      pendingCount: students.filter(s => s.status === 'pending').length,
      approvedCount: students.filter(s => s.status === 'approved').length,
      rejectedCount: students.filter(s => s.status === 'rejected').length,
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

// Ders detaylarını getir (akademisyen bilgileri ile)
exports.getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Ders bilgilerini akademisyen detayları ile getir
    const course = await sql`
      SELECT 
        c.id,
        c.course_name,
        c.course_code,
        c.description,
        c.category,
        c.credits,
        c.price,
        c.course_hours,
        c.quota,
        c.requirements,
        c.equivalency_info,
        c.university_count,
        c.student_count,
        c.application_deadline,
        c.start_date,
        c.end_date,
        c.created_at,
        a.id as academician_id,
        a.username as academician_username,
        a.title as academician_title,
        a.office as academician_office,
        a.office_hours as academician_office_hours,
        a.department as academician_department,
        u.first_name as academician_first_name,
        u.last_name as academician_last_name,
        u.email as academician_email
      FROM courses c
      LEFT JOIN academicians a ON c.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE c.id = ${courseId}
    `;

    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    // Akademisyen bilgilerini düzenle
    const courseData = {
      ...course[0],
      academician: course[0].academician_id ? {
        id: course[0].academician_id,
        username: course[0].academician_username,
        title: course[0].academician_title,
        full_name: `${course[0].academician_first_name || ''} ${course[0].academician_last_name || ''}`.trim(),
        email: course[0].academician_email,
        office: course[0].academician_office,
        office_hours: course[0].academician_office_hours,
        department: course[0].academician_department,
      } : null
    };

    // Akademisyen alanlarını temizle
    delete courseData.academician_id;
    delete courseData.academician_username;
    delete courseData.academician_title;
    delete courseData.academician_first_name;
    delete courseData.academician_last_name;
    delete courseData.academician_email;
    delete courseData.academician_office;
    delete courseData.academician_office_hours;
    delete courseData.academician_department;

    res.json({
      success: true,
      course: courseData,
    });
  } catch (error) {
    console.error("Ders detay hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ders detayları alınırken bir hata oluştu",
    });
  }
};

// Ders güncelle
exports.updateCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const courseId = req.params.id;
    const { courseName, courseCode, description, category, academicianId, applicationDeadline, startDate, endDate } = req.body;

    // Ders var mı kontrol et
    const existingCourse = await sql`SELECT * FROM courses WHERE id = ${courseId}`;
    if (existingCourse.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    let finalAcademicianId = existingCourse[0].academician_id;
    let finalUniversityId = existingCourse[0].university_id;

    // Admin ise, tüm dersleri güncelleyebilir
    if (userType === 'admin') {
      // Akademisyen ID değiştiriliyorsa kontrol et
      if (academicianId !== undefined) {
        if (academicianId === null || academicianId === '') {
          finalAcademicianId = null;
          finalUniversityId = null;
        } else {
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
      }
    } else {
      // Akademisyen ise, sadece kendi dersini güncelleyebilir
      const academician = await sql`
        SELECT id, university_id FROM academicians WHERE user_id = ${userId}
      `;

      if (academician.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Bu işlem için akademisyen yetkisi gereklidir",
        });
      }

      // Dersin sahibi kontrolü
      if (existingCourse[0].academician_id !== academician[0].id) {
        return res.status(403).json({
          success: false,
          message: "Bu dersi güncelleme yetkiniz yok",
        });
      }

      finalAcademicianId = academician[0].id;
      finalUniversityId = academician[0].university_id;
    }

    // Dersi güncelle
    await sql`
      UPDATE courses 
      SET 
        course_name = COALESCE(${courseName}, course_name),
        course_code = COALESCE(${courseCode}, course_code),
        description = COALESCE(${description}, description),
        category = COALESCE(${category}, category),
        academician_id = ${finalAcademicianId},
        university_id = ${finalUniversityId},
        application_deadline = COALESCE(${applicationDeadline}, application_deadline),
        start_date = COALESCE(${startDate}, start_date),
        end_date = COALESCE(${endDate}, end_date)
      WHERE id = ${courseId}
    `;

    res.json({
      success: true,
      message: "Ders başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Ders güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Ders güncellenirken bir hata oluştu",
    });
  }
};

// Akademisyen: Ders başvurularını listele
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

    // Derse yapılan başvuruları getir
    const applications = await sql`
      SELECT 
        f.id as favorite_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        s.student_number,
        f.status,
        f.created_at as application_date
      FROM favorites f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE f.course_id = ${courseId}
      ORDER BY 
        CASE f.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
        END,
        f.created_at DESC
    `;

    res.json({
      success: true,
      course: course[0],
      applications,
      totalApplications: applications.length,
      pendingCount: applications.filter(a => a.status === 'pending').length,
      approvedCount: applications.filter(a => a.status === 'approved').length,
      rejectedCount: applications.filter(a => a.status === 'rejected').length,
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
    const favoriteId = req.params.favoriteId;
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
    const favorite = await sql`
      SELECT f.id, f.course_id, f.status, f.student_id
      FROM favorites f
      JOIN courses c ON f.course_id = c.id
      WHERE f.id = ${favoriteId} AND c.academician_id = ${academician[0].id}
    `;

    if (favorite.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Başvuru bulunamadı veya erişim yetkiniz yok",
      });
    }

    if (favorite[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Sadece beklemedeki başvurular güncellenebilir",
      });
    }

    // Başvuru durumunu güncelle
    await sql`
      UPDATE favorites
      SET status = ${status}
      WHERE id = ${favoriteId}
    `;

    // Eğer reddedildiyse, öğrenci sayısını güncelleme (zaten artırılmamış olmalı)
    // Eğer onaylandıysa, öğrenci sayısı zaten artırılmış olmalı (favorite eklendiğinde)
    // Ama reddedilirse, eğer daha önce approved ise sayıyı azalt
    const oldStatus = favorite[0].status;
    if (oldStatus === "approved" && status === "rejected") {
      await sql`
        UPDATE courses 
        SET student_count = GREATEST(student_count - 1, 0)
        WHERE id = ${favorite[0].course_id}
      `;
    } else if (oldStatus === "pending" && status === "approved") {
      // Pending'den approved'a geçerse, öğrenci sayısını artır
      await sql`
        UPDATE courses 
        SET student_count = student_count + 1
        WHERE id = ${favorite[0].course_id}
      `;
    }

    res.json({
      success: true,
      message: status === "approved" ? "Başvuru onaylandı" : "Başvuru reddedildi",
    });
  } catch (error) {
    console.error("Başvuru durumu güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvuru durumu güncellenirken bir hata oluştu",
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

