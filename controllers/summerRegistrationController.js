const sql = require("../config/db");
const notificationController = require("./notificationController");

// Öğrencinin başvurularını listele
exports.getMyRegistrations = async (req, res) => {
  try {
    // Tablo var mı kontrol et
    await ensureTableExists();
    
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

    // Önce student_failed_courses tablosunun var olup olmadığını kontrol et
    let tableExists = false;
    try {
      const checkTable = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'student_failed_courses'
        )
      `;
      tableExists = checkTable[0]?.exists || false;
    } catch (err) {
      console.log("[getMyRegistrations] Tablo kontrolü hatası:", err.message);
    }

    // Başvuruları getir
    let registrations;
    if (tableExists) {
      registrations = await sql`
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
    } else {
      // Tablo yoksa LEFT JOIN olmadan getir
      registrations = await sql`
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
          NULL as failed_course_name,
          NULL as failed_course_code
        FROM summer_school_registrations sr
        LEFT JOIN summer_school_offerings so ON sr.offering_id = so.id
        LEFT JOIN universities u ON so.university_id = u.id
        LEFT JOIN faculties f ON so.faculty_id = f.id
        WHERE sr.student_id = ${student[0].id}
        ORDER BY sr.application_date DESC
      `;
    }

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

// Tablo var mı kontrol et ve yoksa oluştur
async function ensureTableExists() {
  try {
    // Tablo var mı kontrol et
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'summer_school_registrations'
      )
    `;
    
    if (!tableCheck[0]?.exists) {
      console.log('summer_school_registrations tablosu bulunamadı, oluşturuluyor...');
      
      // Tabloyu oluştur
      await sql`
        CREATE TABLE IF NOT EXISTS summer_school_registrations (
          id SERIAL PRIMARY KEY,
          student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          offering_id INTEGER NOT NULL REFERENCES summer_school_offerings(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
          application_note TEXT,
          rejection_reason TEXT,
          application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status_updated_at TIMESTAMP,
          status_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE(student_id, offering_id)
        )
      `;
      
      // İndeksleri oluştur
      await sql`
        CREATE INDEX IF NOT EXISTS idx_summer_registrations_student_id ON summer_school_registrations(student_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_summer_registrations_offering_id ON summer_school_registrations(offering_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_summer_registrations_status ON summer_school_registrations(status)
      `;
      
      console.log('✅ summer_school_registrations tablosu başarıyla oluşturuldu');
    }
  } catch (error) {
    console.error('Tablo oluşturma hatası:', error);
    throw error;
  }
}

// Yeni başvuru yap
exports.createRegistration = async (req, res) => {
  try {
    // Tablo var mı kontrol et
    await ensureTableExists();
    
    const userId = req.user.id;
    const { offeringId, applicationNote } = req.body;

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
    console.log(`[createRegistration] Başvuru oluşturuluyor - student_id: ${student[0].id}, offering_id: ${offeringId}`);
    
    const newRegistration = await sql`
      INSERT INTO summer_school_registrations (
        student_id,
        offering_id,
        application_note,
        status
      )
      VALUES (
        ${student[0].id},
        ${offeringId},
        ${applicationNote || null},
        'pending'
      )
      RETURNING *
    `;

    console.log(`[createRegistration] Başvuru oluşturuldu - registration_id: ${newRegistration[0].id}, offering_id: ${newRegistration[0].offering_id}`);

    // NOT: current_registrations sadece başvuru onaylandığında artırılacak
    // Başvuru yapıldığında artırılmaz, çünkü henüz onaylanmamıştır
    
    // Akademisyene bildirim gönder
    try {
      const offeringDetailsForNotif = await sql`
        SELECT 
          so.academician_id,
          so.course_name,
          so.course_code,
          a.user_id as academician_user_id
        FROM summer_school_offerings so
        JOIN academicians a ON so.academician_id = a.id
        WHERE so.id = ${offeringId}
      `;
      
      if (offeringDetailsForNotif.length > 0 && offeringDetailsForNotif[0].academician_user_id) {
        console.log(`[createRegistration] Akademisyene bildirim gönderiliyor - user_id: ${offeringDetailsForNotif[0].academician_user_id}`);
        await notificationController.createNotification(
          offeringDetailsForNotif[0].academician_user_id,
          'new_application',
          '📝 Yeni Başvuru',
          `${offeringDetailsForNotif[0].course_name} (${offeringDetailsForNotif[0].course_code}) dersinize yeni bir başvuru yapıldı.`,
          newRegistration[0].id,
          'registration'
        );
        console.log(`[createRegistration] Akademisyen bildirimi başarıyla oluşturuldu`);
      } else {
        console.log(`[createRegistration] Akademisyen user_id bulunamadı`);
      }
    } catch (notifError) {
      console.error('Akademisyen bildirimi oluşturma hatası:', notifError);
    }

    // Öğrencinin derslerine ekle
    try {
      // Teklif bilgilerini al
      const offeringDetails = await sql`
        SELECT 
          so.course_id,
          so.course_name,
          so.course_code,
          so.credits,
          u.name as university_name
        FROM summer_school_offerings so
        LEFT JOIN universities u ON so.university_id = u.id
        WHERE so.id = ${offeringId}
      `;

      const offering = offeringDetails[0];

      // student_courses tablosuna ekle
      await sql`
        INSERT INTO student_courses (
          student_id,
          course_id,
          summer_offering_id,
          registration_id,
          course_name,
          course_code,
          university_name,
          credits,
          enrollment_type,
          status
        )
        VALUES (
          ${student[0].id},
          ${offering.course_id},
          ${offeringId},
          ${newRegistration[0].id},
          ${offering.course_name},
          ${offering.course_code},
          ${offering.university_name},
          ${offering.credits},
          'summer_school',
          'active'
        )
        ON CONFLICT (student_id, course_code) 
        DO UPDATE SET 
          registration_id = ${newRegistration[0].id},
          summer_offering_id = ${offeringId},
          status = 'active'
      `;

      console.log(`✅ Öğrenci ${student[0].id} için ders ${offering.course_code} eklendi`);
    } catch (courseError) {
      console.error("Derse kayıt eklenirken hata:", courseError);
      // Hata olsa bile başvuru devam etsin
    }

    res.status(201).json({
      success: true,
      message: "Başvurunuz başarıyla alındı. Akademisyen onayı bekleniyor.",
      data: newRegistration[0],
    });
  } catch (error) {
    console.error("Başvuru oluşturma hatası:", error);
    console.error("Hata detayı:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Başvuru oluşturulurken bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Başvuruyu iptal et
exports.cancelRegistration = async (req, res) => {
  try {
    // Tablo var mı kontrol et
    await ensureTableExists();
    
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

    // Sadece onaylanmış başvurular iptal edildiğinde current_registrations azaltılır
    // Pending durumundaki başvurular iptal edildiğinde azaltılmaz
    if (registration[0].status === "approved") {
      await sql`
        UPDATE summer_school_offerings
        SET current_registrations = GREATEST(0, current_registrations - 1)
        WHERE id = ${registration[0].offering_id}
      `;
    }

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
    // Tablo var mı kontrol et
    await ensureTableExists();
    
    const userId = req.user.id;
    const offeringId = parseInt(req.params.offeringId);

    console.log(`[getOfferingRegistrations] İstek alındı - userId: ${userId}, offeringId: ${offeringId}`);

    // Akademisyen ID'sini bul
    const academician = await sql`
      SELECT id FROM academicians WHERE user_id = ${userId}
    `;

    if (academician.length === 0) {
      console.log(`[getOfferingRegistrations] Akademisyen bulunamadı - userId: ${userId}`);
      return res.status(403).json({
        success: false,
        message: "Bu işlem için akademisyen yetkisi gereklidir",
      });
    }

    console.log(`[getOfferingRegistrations] Akademisyen ID: ${academician[0].id}`);

    // Teklifin akademisyene ait olup olmadığını kontrol et
    const offering = await sql`
      SELECT 
        id, 
        course_name, 
        course_code,
        academician_id,
        university_id,
        faculty_id,
        start_date,
        end_date,
        application_deadline,
        price,
        quota,
        current_registrations
      FROM summer_school_offerings
      WHERE id = ${offeringId}
    `;

    if (offering.length === 0) {
      console.log(`[getOfferingRegistrations] Teklif bulunamadı - offeringId: ${offeringId}`);
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı",
      });
    }

    console.log(`[getOfferingRegistrations] Teklif bulundu - offeringId: ${offering[0].id}, academician_id: ${offering[0].academician_id}, istenen academician_id: ${academician[0].id}`);

    if (offering[0].academician_id !== academician[0].id) {
      console.log(`[getOfferingRegistrations] Erişim yetkisi yok - teklif academician_id: ${offering[0].academician_id}, kullanıcı academician_id: ${academician[0].id}`);
      return res.status(403).json({
        success: false,
        message: "Bu teklife erişim yetkiniz yok",
      });
    }

    // Önce student_failed_courses tablosunun var olup olmadığını kontrol et
    let tableExists = false;
    try {
      const checkTable = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'student_failed_courses'
        )
      `;
      tableExists = checkTable[0]?.exists || false;
    } catch (err) {
      console.log("[getOfferingRegistrations] Tablo kontrolü hatası:", err.message);
    }

    // Başvuruları getir
    let registrations;
    if (tableExists) {
      registrations = await sql`
        SELECT 
          sr.id,
          sr.status,
          sr.application_note,
          sr.rejection_reason,
          sr.application_date,
          sr.status_updated_at,
          sr.offering_id,
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
    } else {
      // Tablo yoksa LEFT JOIN olmadan getir
      registrations = await sql`
        SELECT 
          sr.id,
          sr.status,
          sr.application_note,
          sr.rejection_reason,
          sr.application_date,
          sr.status_updated_at,
          sr.offering_id,
          u.first_name,
          u.last_name,
          u.email,
          s.student_number,
          NULL as failed_course_name,
          NULL as failed_course_code
        FROM summer_school_registrations sr
        JOIN students s ON sr.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE sr.offering_id = ${offeringId}
        ORDER BY sr.application_date DESC
      `;
    }

    console.log(`[getOfferingRegistrations] ${registrations.length} başvuru bulundu`);

    res.json({
      success: true,
      offering: offering[0],
      data: registrations,
      totalRegistrations: registrations.length,
    });
  } catch (error) {
    console.error("Başvurular listeleme hatası:", error);
    console.error("Hata detayı:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Başvurular alınırken bir hata oluştu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Akademisyen: Başvuru durumunu güncelle (onayla/reddet)
exports.updateRegistrationStatus = async (req, res) => {
  try {
    // Tablo var mı kontrol et
    await ensureTableExists();
    
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

    // Başvuru onaylandığında hem current_registrations sayısını artır hem de öğrencinin derslerine ekle
    if (status === "approved") {
      // current_registrations sayısını artır
      await sql`
        UPDATE summer_school_offerings
        SET current_registrations = current_registrations + 1
        WHERE id = ${registration[0].offering_id}
      `;

      // Öğrencinin derslerine ekle
      try {
        // Başvuru bilgilerini al
        const registrationDetails = await sql`
          SELECT 
            sr.student_id,
            sr.offering_id,
            so.course_id,
            so.course_name,
            so.course_code,
            so.credits,
            u.name as university_name
          FROM summer_school_registrations sr
          JOIN summer_school_offerings so ON sr.offering_id = so.id
          LEFT JOIN universities u ON so.university_id = u.id
          WHERE sr.id = ${registrationId}
        `;

        const regDetail = registrationDetails[0];

        // Öğrencinin derslerine ekle
        await sql`
          INSERT INTO student_courses (
            student_id,
            course_id,
            summer_offering_id,
            registration_id,
            course_name,
            course_code,
            university_name,
            credits,
            enrollment_type,
            status
          )
          VALUES (
            ${regDetail.student_id},
            ${regDetail.course_id},
            ${regDetail.offering_id},
            ${registrationId},
            ${regDetail.course_name},
            ${regDetail.course_code},
            ${regDetail.university_name},
            ${regDetail.credits},
            'summer_school',
            'active'
          )
          ON CONFLICT (student_id, course_code) DO NOTHING
        `;

        console.log(`✅ Öğrenci ${regDetail.student_id} için ders ${regDetail.course_code} eklendi`);
        
        // Öğrenciye bildirim gönder
        try {
          const studentUser = await sql`
            SELECT user_id FROM students WHERE id = ${regDetail.student_id}
          `;
          if (studentUser.length > 0) {
            await notificationController.createNotification(
              studentUser[0].user_id,
              'application_approved',
              '✅ Başvurunuz Onaylandı!',
              `${regDetail.course_name} (${regDetail.course_code}) dersine yaptığınız başvuru onaylandı.`,
              registrationId,
              'registration'
            );
          }
        } catch (notifError) {
          console.error('Bildirim oluşturma hatası:', notifError);
        }
      } catch (courseError) {
        console.error("Derse kayıt eklenirken hata:", courseError);
        // Hata olsa bile başvuru onayı devam etsin
      }
    } else if (status === "rejected") {
      // Başvuru reddedildiğinde öğrenciye bildirim gönder
      try {
        const registrationDetails = await sql`
          SELECT 
            s.user_id as student_user_id,
            so.course_name,
            so.course_code
          FROM summer_school_registrations sr
          JOIN summer_school_offerings so ON sr.offering_id = so.id
          JOIN students s ON sr.student_id = s.id
          WHERE sr.id = ${registrationId}
        `;
        
        if (registrationDetails.length > 0) {
          await notificationController.createNotification(
            registrationDetails[0].student_user_id,
            'application_rejected',
            '❌ Başvurunuz Reddedildi',
            `${registrationDetails[0].course_name} (${registrationDetails[0].course_code}) dersine yaptığınız başvuru reddedildi.${rejectionReason ? ' Sebep: ' + rejectionReason : ''}`,
            registrationId,
            'registration'
          );
        }
      } catch (notifError) {
        console.error('Bildirim oluşturma hatası:', notifError);
      }
    }

    res.json({
      success: true,
      message: status === "approved" ? "Başvuru onaylandı ve öğrenci derse eklendi" : "Başvuru reddedildi",
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


