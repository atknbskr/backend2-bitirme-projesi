const sql = require("../config/db");

// Öğrencinin başvurularını listele
exports.getMyRegistrations = async (req, res) => {
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

    const registrations = await sql`
      SELECT 
        sr.id,
        sr.status,
        sr.application_note,
        sr.rejection_reason,
        sr.application_date,
        sr.status_updated_at,
        so.id as offering_id,
        so.course_name,
        so.course_code,
        so.start_date,
        so.end_date,
        so.application_deadline,
        so.price,
        so.quota,
        so.current_registrations,
        u.name as university_name,
        u.city as university_city,
        f.name as faculty_name,
        sfc.course_name as failed_course_name,
        sfc.course_code as failed_course_code
      FROM summer_school_registrations sr
      LEFT JOIN summer_school_offerings so ON sr.offering_id = so.id
      LEFT JOIN universities u ON so.university_id = u.id
      LEFT JOIN faculties f ON so.faculty_id = f.id
      LEFT JOIN student_failed_courses sfc ON sr.failed_course_id = sfc.id
      WHERE sr.student_id = ${student[0].id}
      ORDER BY sr.application_date DESC
    `;

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    console.error("Başvurular listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvurular alınırken bir hata oluştu",
    });
  }
};

// Yeni başvuru yap
exports.createRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { offeringId, failedCourseId, applicationNote } = req.body;

    if (!offeringId) {
      return res.status(400).json({
        success: false,
        message: "Teklif ID'si gereklidir",
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

    // Teklifi kontrol et
    const offering = await sql`
      SELECT 
        id,
        course_name,
        application_deadline,
        quota,
        current_registrations,
        is_active
      FROM summer_school_offerings
      WHERE id = ${offeringId}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Yaz okulu teklifi bulunamadı",
      });
    }

    if (!offering[0].is_active) {
      return res.status(400).json({
        success: false,
        message: "Bu teklif artık aktif değil",
      });
    }

    // Başvuru tarihi geçmiş mi?
    const deadline = new Date(offering[0].application_deadline);
    const now = new Date();
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: "Başvuru süresi sona ermiş",
      });
    }

    // Kontenjan dolu mu?
    if (offering[0].current_registrations >= offering[0].quota) {
      return res.status(400).json({
        success: false,
        message: "Kontenjan dolu",
      });
    }

    // Aynı teklife daha önce başvurmuş mu?
    const existingRegistration = await sql`
      SELECT id, status FROM summer_school_registrations
      WHERE student_id = ${student[0].id} AND offering_id = ${offeringId}
    `;

    if (existingRegistration.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu teklife zaten başvurdunuz",
        existingStatus: existingRegistration[0].status,
      });
    }

    // Başvuru oluştur
    const newRegistration = await sql`
      INSERT INTO summer_school_registrations (
        student_id,
        offering_id,
        failed_course_id,
        application_note,
        status
      )
      VALUES (
        ${student[0].id},
        ${offeringId},
        ${failedCourseId || null},
        ${applicationNote || null},
        'pending'
      )
      RETURNING *
    `;

    // Teklifteki current_registrations sayısını artır
    await sql`
      UPDATE summer_school_offerings
      SET current_registrations = current_registrations + 1
      WHERE id = ${offeringId}
    `;

    res.status(201).json({
      success: true,
      message: "Başvurunuz başarıyla alındı",
      data: newRegistration[0],
    });
  } catch (error) {
    console.error("Başvuru oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvuru oluşturulurken bir hata oluştu",
    });
  }
};

// Başvuruyu iptal et
exports.cancelRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrationId = req.params.id;

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

    // Başvurunun öğrenciye ait olup olmadığını kontrol et
    const registration = await sql`
      SELECT id, offering_id, status FROM summer_school_registrations
      WHERE id = ${registrationId} AND student_id = ${student[0].id}
    `;

    if (registration.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Başvuru bulunamadı",
      });
    }

    if (registration[0].status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Başvuru zaten iptal edilmiş",
      });
    }

    // Başvuruyu iptal et
    await sql`
      UPDATE summer_school_registrations
      SET status = 'cancelled', status_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${registrationId}
    `;

    // Teklifteki current_registrations sayısını azalt
    await sql`
      UPDATE summer_school_offerings
      SET current_registrations = GREATEST(0, current_registrations - 1)
      WHERE id = ${registration[0].offering_id}
    `;

    res.json({
      success: true,
      message: "Başvurunuz iptal edildi",
    });
  } catch (error) {
    console.error("Başvuru iptal etme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Başvuru iptal edilirken bir hata oluştu",
    });
  }
};

// Akademisyen: Bir teklife yapılan başvuruları görüntüle
exports.getOfferingRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const offeringId = req.params.offeringId;

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
      SELECT id, course_name FROM summer_school_offerings
      WHERE id = ${offeringId} AND academician_id = ${academician[0].id}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı veya erişim yetkiniz yok",
      });
    }

    // Başvuruları getir
    const registrations = await sql`
      SELECT 
        sr.id,
        sr.status,
        sr.application_note,
        sr.rejection_reason,
        sr.application_date,
        sr.status_updated_at,
        u.first_name,
        u.last_name,
        u.email,
        s.student_number,
        sfc.course_name as failed_course_name,
        sfc.course_code as failed_course_code
      FROM summer_school_registrations sr
      JOIN students s ON sr.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_failed_courses sfc ON sr.failed_course_id = sfc.id
      WHERE sr.offering_id = ${offeringId}
      ORDER BY sr.application_date DESC
    `;

    res.json({
      success: true,
      offering: offering[0],
      data: registrations,
      totalRegistrations: registrations.length,
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
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrationId = req.params.id;
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

    // Başvurunun akademisyenin teklifine ait olup olmadığını kontrol et
    const registration = await sql`
      SELECT sr.id, sr.status, sr.offering_id
      FROM summer_school_registrations sr
      JOIN summer_school_offerings so ON sr.offering_id = so.id
      WHERE sr.id = ${registrationId} AND so.academician_id = ${academician[0].id}
    `;

    if (registration.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Başvuru bulunamadı veya erişim yetkiniz yok",
      });
    }

    if (registration[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Sadece beklemedeki başvurular güncellenebilir",
      });
    }

    // Başvuru durumunu güncelle
    const updated = await sql`
      UPDATE summer_school_registrations
      SET 
        status = ${status},
        rejection_reason = ${status === "rejected" ? rejectionReason || null : null},
        status_updated_at = CURRENT_TIMESTAMP,
        status_updated_by = ${userId}
      WHERE id = ${registrationId}
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

