const sql = require("../config/db");

// Tüm dersleri listele (summer_school_offerings tablosundan)
exports.getAllCourses = async (req, res) => {
  try {
    console.log('📚 Tüm dersler listeleniyor (summer_school_offerings)...');
    console.log('Request user:', req.user || 'Herkese açık');
    
    // Önce summer_school_offerings tablosunun var olup olmadığını kontrol et
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'summer_school_offerings'
        )
      `;
      
      if (!tableCheck[0].exists) {
        console.error('❌ summer_school_offerings tablosu bulunamadı!');
        return res.status(500).json({
          success: false,
          message: "summer_school_offerings tablosu bulunamadı. Veritabanı şemasını kontrol edin.",
        });
      }
    } catch (tableError) {
      console.error('❌ Tablo kontrolü hatası:', tableError.message);
    }
    
    // SQL sorgusunu çalıştır - summer_school_offerings tablosundan
    const courses = await sql`
      SELECT 
        so.id,
        so.course_name,
        so.course_code,
        so.description,
        NULL as category,
        so.academician_id,
        so.university_id,
        0 as university_count,
        COALESCE(so.current_registrations, 0) as student_count,
        so.application_deadline,
        so.start_date,
        so.end_date,
        so.created_at,
        COALESCE(u.first_name || ' ' || u.last_name, 'Belirtilmemiş') as academician_name,
        uni.name as university_name,
        uni.city as university_city,
        so.price,
        so.credits,
        so.course_hours,
        so.quota,
        COALESCE(so.language, 'turkish') as language,
        so.equivalency_info,
        so.requirements,
        CASE 
          WHEN so.is_active = true AND (so.application_deadline IS NULL OR so.application_deadline >= CURRENT_DATE) THEN true
          ELSE false
        END as is_active
      FROM summer_school_offerings so
      LEFT JOIN academicians a ON so.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN universities uni ON so.university_id = uni.id
      WHERE so.is_active = true
        AND (so.application_deadline IS NULL OR so.application_deadline >= CURRENT_DATE)
      ORDER BY so.created_at DESC
    `;

    console.log('✅ Bulunan ders sayısı:', courses.length);
    if (courses.length > 0) {
      console.log('İlk ders örneği:', {
        id: courses[0].id,
        name: courses[0].course_name,
        deadline: courses[0].application_deadline,
        academician: courses[0].academician_name
      });
    } else {
      console.log('⚠️ Hiç ders bulunamadı (bu normal olabilir)');
    }

    res.json({
      success: true,
      courses: courses,
    });
  } catch (error) {
    console.error("❌ Ders listeleme hatası:", error);
    console.error("Hata detayı:", error.message);
    console.error("Hata kodu:", error.code);
    console.error("Stack trace:", error.stack);
    
    // Daha açıklayıcı hata mesajı
    let errorMessage = "Dersler alınırken bir hata oluştu";
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        detail: error.detail
      } : undefined
    });
  }
};

// Akademisyenin derslerini listele (summer_school_offerings tablosundan)
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

    // Sadece kendine ait dersleri listele (summer_school_offerings tablosundan)
    const courses = await sql`
      SELECT 
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
        so.price,
        so.credits,
        so.course_hours,
        so.quota,
        COALESCE(so.language, 'turkish') as language,
        so.equivalency_info,
        so.requirements,
        CASE 
          WHEN so.is_active = true AND (so.application_deadline IS NULL OR so.application_deadline >= CURRENT_DATE) THEN true
          ELSE false
        END as is_active
      FROM summer_school_offerings so
      WHERE so.academician_id = ${academician[0].id}
        AND so.is_active = true
      ORDER BY so.created_at DESC
    `;

    console.log(`✅ Akademisyen ${academician[0].id} için ${courses.length} ders bulundu`);

    res.json({
      success: true,
      courses: courses,
    });
  } catch (error) {
    console.error("Ders listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Dersler alınırken bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Yeni ders ekle
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    const { courseName, courseCode, description, category, academicianId, applicationDeadline, startDate, endDate, price, quota, language } = req.body;

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
      INSERT INTO courses (academician_id, course_name, course_code, description, category, university_id, application_deadline, start_date, end_date, price, quota, language)
      VALUES (${finalAcademicianId}, ${courseName}, ${courseCode || null}, ${description || null}, ${category || null}, ${finalUniversityId}, ${applicationDeadline || null}, ${startDate || null}, ${endDate || null}, ${price || 0}, ${quota || 30}, ${language || 'turkish'})
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
      SELECT id, course_name FROM summer_school_offerings 
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
        so.is_active
      FROM summer_school_offerings so
      WHERE so.academician_id = ${academician[0].id}
        AND (so.university_id = ${academician[0].university_id} OR so.university_id IS NULL)
        AND so.is_active = true
      ORDER BY so.created_at DESC
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

    // Ders bilgilerini akademisyen detayları ile getir (summer_school_offerings tablosundan)
    const course = await sql`
      SELECT 
        so.id,
        so.course_name,
        so.course_code,
        so.description,
        NULL as category,
        so.credits,
        so.price,
        so.course_hours,
        so.quota,
        COALESCE(so.language, 'turkish') as language,
        so.requirements,
        so.equivalency_info,
        so.university_id,
        0 as university_count,
        COALESCE(so.current_registrations, 0) as student_count,
        so.application_deadline,
        so.start_date,
        so.end_date,
        so.created_at,
        a.id as academician_id,
        a.username as academician_username,
        a.title as academician_title,
        a.office as academician_office,
        a.office_hours as academician_office_hours,
        a.department as academician_department,
        u.first_name as academician_first_name,
        u.last_name as academician_last_name,
        u.email as academician_email,
        uni.name as university_name,
        uni.city as university_city
      FROM summer_school_offerings so
      LEFT JOIN academicians a ON so.academician_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN universities uni ON so.university_id = uni.id
      WHERE so.id = ${courseId} AND so.is_active = true
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
    const { courseName, courseCode, description, category, academicianId, universityId, applicationDeadline, startDate, endDate, price, quota, language } = req.body;

    // Ders var mı kontrol et
    const existingCourse = await sql`SELECT * FROM summer_school_offerings WHERE id = ${courseId}`;
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
      // Üniversite ID değiştiriliyorsa kontrol et
      if (universityId !== undefined && universityId !== null && universityId !== '') {
        // String'i integer'a çevir
        const universityIdInt = parseInt(universityId);
        if (isNaN(universityIdInt)) {
          return res.status(400).json({
            success: false,
            message: "Geçersiz üniversite ID formatı",
          });
        }
        
        const university = await sql`SELECT id FROM universities WHERE id = ${universityIdInt}`;
        if (university.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Geçersiz üniversite ID",
          });
        }
        finalUniversityId = universityIdInt;
      }
      
      // Akademisyen ID değiştiriliyorsa kontrol et
      if (academicianId !== undefined && academicianId !== null && academicianId !== '') {
        // String'i integer'a çevir
        const academicianIdInt = parseInt(academicianId);
        if (isNaN(academicianIdInt)) {
          return res.status(400).json({
            success: false,
            message: "Geçersiz akademisyen ID formatı",
          });
        }
        
        const academician = await sql`SELECT id, university_id FROM academicians WHERE id = ${academicianIdInt}`;
        if (academician.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Geçersiz akademisyen ID",
          });
        }
        finalAcademicianId = academicianIdInt;
        // Üniversite ID manuel olarak değiştirilmediyse akademisyenin üniversitesini kullan
        if (universityId === undefined || universityId === null || universityId === '') {
          finalUniversityId = academician[0].university_id;
        }
      } else if (academicianId === null || academicianId === '') {
        // Akademisyen null veya boş string ise
        finalAcademicianId = null;
        // Üniversite ID değiştirilmediyse null yap
        if (universityId === undefined || universityId === null || universityId === '') {
          finalUniversityId = null;
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
      UPDATE summer_school_offerings 
      SET 
        course_name = COALESCE(${courseName}, course_name),
        course_code = COALESCE(${courseCode}, course_code),
        description = COALESCE(${description}, description),
        academician_id = ${finalAcademicianId},
        university_id = ${finalUniversityId},
        application_deadline = COALESCE(${applicationDeadline}, application_deadline),
        start_date = COALESCE(${startDate}, start_date),
        end_date = COALESCE(${endDate}, end_date),
        price = COALESCE(${price}, price),
        quota = COALESCE(${quota}, quota),
        language = COALESCE(${language}, language),
        updated_at = CURRENT_TIMESTAMP
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
      SELECT id, course_name FROM summer_school_offerings 
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
      JOIN summer_school_offerings so ON f.course_id = so.id
      WHERE f.id = ${favoriteId} AND so.academician_id = ${academician[0].id}
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
    // summer_school_offerings'de current_registrations kullanılıyor
    // Favori durumu değiştiğinde current_registrations güncellenmez
    // Çünkü bu sadece onaylanmış başvurular için kullanılıyor

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
      const course = await sql`SELECT id FROM summer_school_offerings WHERE id = ${courseId}`;
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
        SELECT id FROM summer_school_offerings 
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

    // Dersi sil (soft delete - is_active = false yap)
    await sql`
      UPDATE summer_school_offerings 
      SET is_active = false 
      WHERE id = ${courseId}
    `;

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

