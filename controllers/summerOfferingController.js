const sql = require("../config/db");
const notificationController = require("./notificationController");

// Tüm yaz okulu tekliflerini listele (filtreleme ile)
exports.getAllOfferings = async (req, res) => {
  try {
    const {
      universityId,
      facultyId,
      city,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      applicationStartDate,
      applicationEndDate,
      hasAvailability,
      courseCode,
      search,
      language,
    } = req.query;

    let offerings;

    // Basit sorgular için direkt filtreleme
    if (!universityId && !facultyId && !city && !minPrice && !maxPrice && !startDate && !endDate && !applicationStartDate && !applicationEndDate && !courseCode && !search && !language) {
      // Filtre yok - tüm aktif teklifleri getir
      if (hasAvailability === "true") {
        offerings = await sql`
          SELECT 
            so.id,
            so.course_name,
            so.course_code,
            so.description,
            so.course_hours,
            so.credits,
            so.start_date,
            so.end_date,
            so.application_start_date,
            so.application_deadline,
            so.price,
            so.quota,
            so.current_registrations,
            so.equivalency_info,
            so.requirements,
            so.is_active,
            so.udemy_link,
            so.created_at,
            u.name as university_name,
            u.city as university_city,
            u.type as university_type,
            f.name as faculty_name,
            usr.first_name || ' ' || usr.last_name as academician_name,
            a.title as academician_title,
            COALESCE(so.language, 'turkish') as language,
            (so.quota - so.current_registrations) as available_slots
          FROM summer_school_offerings so
          LEFT JOIN universities u ON so.university_id = u.id
          LEFT JOIN faculties f ON so.faculty_id = f.id
          LEFT JOIN academicians a ON so.academician_id = a.id
          LEFT JOIN users usr ON a.user_id = usr.id
          WHERE so.is_active = true
            AND so.application_deadline >= CURRENT_DATE
            AND so.current_registrations < so.quota
          ORDER BY so.application_deadline ASC, so.start_date ASC
        `;
      } else {
        offerings = await sql`
          SELECT 
            so.id,
            so.course_name,
            so.course_code,
            so.description,
            so.course_hours,
            so.credits,
            so.start_date,
            so.end_date,
            so.application_start_date,
            so.application_deadline,
            so.price,
            so.quota,
            so.current_registrations,
            so.equivalency_info,
            so.requirements,
            so.is_active,
            so.udemy_link,
            so.created_at,
            u.name as university_name,
            u.city as university_city,
            u.type as university_type,
            f.name as faculty_name,
            usr.first_name || ' ' || usr.last_name as academician_name,
            a.title as academician_title,
            COALESCE(so.language, 'turkish') as language,
            (so.quota - so.current_registrations) as available_slots
          FROM summer_school_offerings so
          LEFT JOIN universities u ON so.university_id = u.id
          LEFT JOIN faculties f ON so.faculty_id = f.id
          LEFT JOIN academicians a ON so.academician_id = a.id
          LEFT JOIN users usr ON a.user_id = usr.id
          WHERE so.is_active = true
            AND so.application_deadline >= CURRENT_DATE
          ORDER BY so.application_deadline ASC, so.start_date ASC
        `;
      }
    } else {
      // Filtreler var - her filtre için ayrı sorgu yap (en basit çözüm)
      // Önce tüm kayıtları al, sonra JavaScript'te filtrele
      let allOfferings = await sql`
        SELECT 
          so.id,
          so.course_name,
          so.course_code,
          so.description,
          so.course_hours,
          so.credits,
          so.start_date,
          so.end_date,
          so.application_start_date,
          so.application_deadline,
          so.price,
          so.quota,
          so.current_registrations,
          so.equivalency_info,
          so.requirements,
          so.is_active,
          so.udemy_link,
          so.created_at,
          so.university_id,
          so.faculty_id,
          u.name as university_name,
          u.city as university_city,
          u.type as university_type,
          f.name as faculty_name,
          usr.first_name || ' ' || usr.last_name as academician_name,
          COALESCE(so.language, 'turkish') as language,
          (so.quota - so.current_registrations) as available_slots
        FROM summer_school_offerings so
        LEFT JOIN universities u ON so.university_id = u.id
        LEFT JOIN faculties f ON so.faculty_id = f.id
        LEFT JOIN academicians a ON so.academician_id = a.id
        LEFT JOIN users usr ON a.user_id = usr.id
        WHERE so.is_active = true
          AND so.application_deadline >= CURRENT_DATE
        ORDER BY so.application_deadline ASC, so.start_date ASC
      `;
      
      // JavaScript'te filtrele
      offerings = allOfferings.filter(offering => {
        // Üniversite filtresi
        if (universityId) {
          const offeringUniId = offering.university_id ? parseInt(offering.university_id) : null;
          const filterUniId = parseInt(universityId);
          if (offeringUniId !== filterUniId) return false;
        }
        
        // Fakülte filtresi
        if (facultyId) {
          const offeringFacId = offering.faculty_id ? parseInt(offering.faculty_id) : null;
          const filterFacId = parseInt(facultyId);
          if (offeringFacId !== filterFacId) return false;
        }
        
        // Şehir filtresi
        if (city && offering.university_city !== city) return false;
        
        // Fiyat filtreleri
        const offeringPrice = offering.price ? parseFloat(offering.price) : 0;
        if (minPrice) {
          const minPriceNum = parseFloat(minPrice);
          if (isNaN(minPriceNum) || offeringPrice < minPriceNum) return false;
        }
        if (maxPrice) {
          const maxPriceNum = parseFloat(maxPrice);
          if (isNaN(maxPriceNum) || offeringPrice > maxPriceNum) return false;
        }
        
        // Ders başlangıç/bitiş tarihi filtreleri
        if (startDate && offering.start_date) {
          const offeringStartDate = new Date(offering.start_date);
          const filterStartDate = new Date(startDate);
          if (offeringStartDate < filterStartDate) return false;
        }
        if (endDate && offering.end_date) {
          const offeringEndDate = new Date(offering.end_date);
          const filterEndDate = new Date(endDate);
          if (offeringEndDate > filterEndDate) return false;
        }
        
        // Başvuru tarihi filtreleri
        if (applicationStartDate && offering.application_start_date) {
          const offeringAppStartDate = new Date(offering.application_start_date);
          const filterAppStartDate = new Date(applicationStartDate);
          if (offeringAppStartDate < filterAppStartDate) return false;
        }
        if (applicationEndDate && offering.application_deadline) {
          const offeringAppEndDate = new Date(offering.application_deadline);
          const filterAppEndDate = new Date(applicationEndDate);
          if (offeringAppEndDate > filterAppEndDate) return false;
        }
        
        // Kontenjan filtresi
        if (hasAvailability === "true") {
          const availableSlots = offering.available_slots ? parseInt(offering.available_slots) : 0;
          if (availableSlots <= 0) return false;
        }
        
        // Ders kodu filtresi
        if (courseCode && offering.course_code) {
          if (!offering.course_code.toLowerCase().includes(courseCode.toLowerCase())) return false;
        }
        
        // Dil filtresi
        if (language && offering.language !== language) return false;
        
        // Arama filtresi
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesName = offering.course_name?.toLowerCase().includes(searchLower);
          const matchesCode = offering.course_code?.toLowerCase().includes(searchLower);
          const matchesDesc = offering.description?.toLowerCase().includes(searchLower);
          if (!matchesName && !matchesCode && !matchesDesc) return false;
        }
        
        return true;
      });
    }

    res.json({
      success: true,
      data: offerings,
      count: offerings.length,
    });
  } catch (error) {
    console.error("Yaz okulu teklifleri listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yaz okulu teklifleri alınırken bir hata oluştu",
    });
  }
};

// Tek bir teklifi detaylı getir
exports.getOfferingById = async (req, res) => {
  try {
    const offeringId = req.params.id;

    const offering = await sql`
      SELECT 
        so.*,
        so.udemy_link,
        u.name as university_name,
        u.city as university_city,
        u.type as university_type,
        u.website as university_website,
        f.name as faculty_name,
        f.description as faculty_description,
        usr.first_name || ' ' || usr.last_name as academician_name,
        usr.email as academician_email,
        (so.quota - so.current_registrations) as available_slots
      FROM summer_school_offerings so
      LEFT JOIN universities u ON so.university_id = u.id
      LEFT JOIN faculties f ON so.faculty_id = f.id
      LEFT JOIN academicians a ON so.academician_id = a.id
      LEFT JOIN users usr ON a.user_id = usr.id
      WHERE so.id = ${offeringId}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Yaz okulu teklifi bulunamadı",
      });
    }

    res.json({
      success: true,
      data: offering[0],
    });
  } catch (error) {
    console.error("Yaz okulu teklifi getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yaz okulu teklifi alınırken bir hata oluştu",
    });
  }
};

// Akademisyenin kendi tekliflerini listele
exports.getMyOfferings = async (req, res) => {
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

    const offerings = await sql`
      SELECT 
        so.*,
        so.udemy_link,
        u.name as university_name,
        u.city as university_city,
        f.name as faculty_name,
        usr.first_name || ' ' || usr.last_name as academician_name,
        (so.quota - so.current_registrations) as available_slots
      FROM summer_school_offerings so
      LEFT JOIN universities u ON so.university_id = u.id
      LEFT JOIN faculties f ON so.faculty_id = f.id
      LEFT JOIN academicians a ON so.academician_id = a.id
      LEFT JOIN users usr ON a.user_id = usr.id
      WHERE so.academician_id = ${academician[0].id}
      ORDER BY so.created_at DESC
    `;

    res.json({
      success: true,
      data: offerings,
    });
  } catch (error) {
    console.error("Akademisyen teklifleri listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Teklifler alınırken bir hata oluştu",
    });
  }
};

// Yeni teklif oluştur
exports.createOffering = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      courseId,
      universityId,
      facultyId,
      courseName,
      courseCode,
      description,
      courseHours,
      credits,
      startDate,
      endDate,
      applicationStartDate,
      applicationDeadline,
      price,
      quota,
      language,
      equivalencyInfo,
      requirements,
      udemyLink,
    } = req.body;

    // Validasyon
    if (!courseName || !courseCode) {
      return res.status(400).json({
        success: false,
        message: "Ders adı ve ders kodu gereklidir",
      });
    }

    if (!startDate || !endDate || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Tarih bilgileri eksik",
      });
    }

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

    // Eğer universityId gönderilmemişse, akademisyenin university_id'sini kullan
    const finalUniversityId = universityId || academician[0].university_id;
    
    if (!finalUniversityId) {
      return res.status(400).json({
        success: false,
        message: "Üniversite bilgisi gereklidir. Lütfen profil ayarlarınızdan üniversitenizi seçin.",
      });
    }

    // Yeni teklif oluştur
    const newOffering = await sql`
      INSERT INTO summer_school_offerings (
        course_id,
        university_id,
        faculty_id,
        academician_id,
        course_name,
        course_code,
        description,
        course_hours,
        credits,
        start_date,
        end_date,
        application_start_date,
        application_deadline,
        price,
        quota,
        language,
        equivalency_info,
        requirements,
        udemy_link
      )
      VALUES (
        ${courseId || null},
        ${finalUniversityId},
        ${facultyId || null},
        ${academician[0].id},
        ${courseName},
        ${courseCode},
        ${description || null},
        ${courseHours || null},
        ${credits || null},
        ${startDate},
        ${endDate},
        ${applicationStartDate || startDate},
        ${applicationDeadline},
        ${price || 0},
        ${quota || 30},
        ${language || 'turkish'},
        ${equivalencyInfo || null},
        ${requirements || null},
        ${udemyLink || null}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Yaz okulu teklifi başarıyla oluşturuldu",
      data: newOffering[0],
    });
  } catch (error) {
    console.error("Yaz okulu teklifi oluşturma hatası:", error);
    console.error("Hata detayı:", error.message);
    console.error("Hata kodu:", error.code);
    
    // Veritabanı hatası kontrolü
    let errorMessage = "Yaz okulu teklifi oluşturulurken bir hata oluştu";
    if (error.code === '42703') {
      errorMessage = "Veritabanı hatası: 'language' alanı bulunamadı. Lütfen addLanguageToSummerOfferings.sql dosyasını çalıştırın.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Teklifi güncelle
exports.updateOffering = async (req, res) => {
  try {
    const userId = req.user.id;
    const offeringId = req.params.id;
    const updateData = req.body;

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

    // Teklifin akademisyene ait olup olmadığını kontrol et ve mevcut linki al
    const offering = await sql`
      SELECT id, udemy_link, course_name, course_code FROM summer_school_offerings
      WHERE id = ${offeringId} AND academician_id = ${academician[0].id}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı veya güncelleme yetkiniz yok",
      });
    }

    const oldLink = offering[0].udemy_link;
    const newLink = updateData.udemyLink || null;
    const linkChanged = oldLink !== newLink && newLink !== null && newLink.trim() !== '';

    // Güncelleme
    const updated = await sql`
      UPDATE summer_school_offerings
      SET
        course_name = COALESCE(${updateData.courseName}, course_name),
        course_code = COALESCE(${updateData.courseCode}, course_code),
        description = COALESCE(${updateData.description}, description),
        course_hours = COALESCE(${updateData.courseHours}, course_hours),
        credits = COALESCE(${updateData.credits}, credits),
        start_date = COALESCE(${updateData.startDate}, start_date),
        end_date = COALESCE(${updateData.endDate}, end_date),
        application_deadline = COALESCE(${updateData.applicationDeadline}, application_deadline),
        price = COALESCE(${updateData.price}, price),
        quota = COALESCE(${updateData.quota}, quota),
        language = COALESCE(${updateData.language}, language),
        equivalency_info = COALESCE(${updateData.equivalencyInfo}, equivalency_info),
        requirements = COALESCE(${updateData.requirements}, requirements),
        udemy_link = COALESCE(${updateData.udemyLink}, udemy_link),
        is_active = COALESCE(${updateData.isActive}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${offeringId}
      RETURNING *
    `;

    // Eğer link eklendi veya güncellendiyse, kayıtlı öğrencilere bildirim gönder
    if (linkChanged) {
      try {
        // Bu derse kayıtlı öğrencileri bul
        const enrolledStudents = await sql`
          SELECT DISTINCT s.user_id, u.first_name, u.last_name
          FROM student_courses sc
          JOIN students s ON sc.student_id = s.id
          JOIN users u ON s.user_id = u.id
          WHERE sc.summer_offering_id = ${offeringId}
            AND sc.status = 'active'
        `;
        
        console.log(`[updateOffering] ${enrolledStudents.length} öğrenciye bildirim gönderiliyor`);
        
        // Her öğrenciye bildirim gönder
        for (const student of enrolledStudents) {
          await notificationController.createNotification(
            student.user_id,
            'course_link_added',
            '🔗 Ders Linki Eklendi!',
            `${offering[0].course_name}${offering[0].course_code ? ' (' + offering[0].course_code + ')' : ''} dersinize link eklendi. Ders içeriğine erişmek için anasayfanızdaki "Kayıtlı Olduğum Dersler" bölümünden linke tıklayabilirsiniz.`,
            offeringId,
            'offering'
          );
        }
        
        console.log(`[updateOffering] Bildirimler başarıyla gönderildi`);
      } catch (notifError) {
        console.error('[updateOffering] Bildirim gönderme hatası:', notifError);
        // Bildirim hatası olsa bile güncelleme devam etsin
      }
    }

    res.json({
      success: true,
      message: "Teklif başarıyla güncellendi",
      data: updated[0],
    });
  } catch (error) {
    console.error("Teklif güncelleme hatası:", error);
    console.error("Hata detayı:", error.message);
    console.error("Hata kodu:", error.code);
    
    // Veritabanı hatası kontrolü
    let errorMessage = "Teklif güncellenirken bir hata oluştu";
    if (error.code === '42703') {
      errorMessage = "Veritabanı hatası: 'language' alanı bulunamadı. Lütfen addLanguageToSummerOfferings.sql dosyasını çalıştırın.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Teklifi sil
exports.deleteOffering = async (req, res) => {
  try {
    const userId = req.user.id;
    const offeringId = req.params.id;

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

    // Teklifin akademisyene ait olup olmadığını kontrol et
    const offering = await sql`
      SELECT id FROM summer_school_offerings
      WHERE id = ${offeringId} AND academician_id = ${academician[0].id}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı veya silme yetkiniz yok",
      });
    }

    // Soft delete (is_active = false)
    await sql`
      UPDATE summer_school_offerings
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${offeringId}
    `;

    res.json({
      success: true,
      message: "Teklif başarıyla silindi",
    });
  } catch (error) {
    console.error("Teklif silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Teklif silinirken bir hata oluştu",
    });
  }
};

// Akademisyen: Dersine kayıtlı öğrencileri listele
exports.getEnrolledStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const offeringId = parseInt(req.params.id);

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

    // Teklifin akademisyene ait olup olmadığını kontrol et
    const offering = await sql`
      SELECT id, course_name, course_code FROM summer_school_offerings
      WHERE id = ${offeringId} AND academician_id = ${academician[0].id}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı veya bu derse erişim yetkiniz yok",
      });
    }

    // Derse kayıtlı öğrencileri getir (sadece aktif kayıtlar)
    const enrolledStudents = await sql`
      SELECT 
        sc.id as student_course_id,
        sc.student_id,
        sc.status,
        sc.enrolled_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        s.student_number
      FROM student_courses sc
      INNER JOIN students s ON sc.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE sc.summer_offering_id = ${offeringId}
        AND sc.status = 'active'
      ORDER BY sc.enrolled_at DESC
    `;

    res.json({
      success: true,
      data: enrolledStudents.map(student => ({
        id: student.student_course_id,
        studentId: student.student_id,
        userId: student.user_id,
        firstName: student.first_name,
        lastName: student.last_name,
        fullName: `${student.first_name} ${student.last_name}`,
        email: student.email,
        studentNumber: student.student_number,
        status: student.status,
        enrolledAt: student.enrolled_at
      })),
      course: {
        id: offering[0].id,
        courseName: offering[0].course_name,
        courseCode: offering[0].course_code
      }
    });
  } catch (error) {
    console.error("Kayıtlı öğrenciler listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Öğrenciler listelenirken bir hata oluştu",
    });
  }
};

// Akademisyen: Öğrenciyi dersten çıkar
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const offeringId = parseInt(req.params.offeringId);
    const studentCourseId = parseInt(req.params.studentCourseId);

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

    // Teklifin akademisyene ait olup olmadığını kontrol et
    const offering = await sql`
      SELECT id, current_registrations FROM summer_school_offerings
      WHERE id = ${offeringId} AND academician_id = ${academician[0].id}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı veya bu derse erişim yetkiniz yok",
      });
    }

    // Öğrenci kaydını kontrol et
    const studentCourse = await sql`
      SELECT id, student_id, status, registration_id, summer_offering_id
      FROM student_courses
      WHERE id = ${studentCourseId} AND summer_offering_id = ${offeringId}
    `;

    if (studentCourse.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Öğrenci kaydı bulunamadı",
      });
    }

    if (studentCourse[0].status === "withdrawn") {
      return res.status(400).json({
        success: false,
        message: "Bu öğrenci zaten dersten çıkarılmış",
      });
    }

    // Öğrenciyi dersten çıkar
    await sql`
      UPDATE student_courses
      SET status = 'withdrawn'
      WHERE id = ${studentCourseId}
    `;

    // İlgili başvuruyu da iptal et
    if (studentCourse[0].registration_id) {
      await sql`
        UPDATE summer_school_registrations
        SET status = 'cancelled', status_updated_at = CURRENT_TIMESTAMP
        WHERE id = ${studentCourse[0].registration_id}
      `;
    }

    // Summer offering'in current_registrations sayısını azalt
    const newCount = Math.max(0, (offering[0].current_registrations || 0) - 1);
    await sql`
      UPDATE summer_school_offerings
      SET current_registrations = ${newCount}
      WHERE id = ${offeringId}
    `;

    res.json({
      success: true,
      message: "Öğrenci başarıyla dersten çıkarıldı",
    });
  } catch (error) {
    console.error("Öğrenci çıkarma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Öğrenci çıkarılırken bir hata oluştu",
    });
  }
};

