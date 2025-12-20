const sql = require("../config/db");

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
      hasAvailability,
      courseCode,
      search,
    } = req.query;

    let offerings;

    // Basit sorgular için direkt filtreleme
    if (!universityId && !facultyId && !city && !minPrice && !maxPrice && !startDate && !endDate && !courseCode && !search) {
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
            so.created_at,
            u.name as university_name,
            u.city as university_city,
            u.type as university_type,
            f.name as faculty_name,
            usr.first_name || ' ' || usr.last_name as academician_name,
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
            so.created_at,
            u.name as university_name,
            u.city as university_city,
            u.type as university_type,
            f.name as faculty_name,
            usr.first_name || ' ' || usr.last_name as academician_name,
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
      // Filtreler var - dinamik query oluştur
      let conditions = [
        sql`so.is_active = true`,
        sql`so.application_deadline >= CURRENT_DATE`
      ];
      
      if (universityId) conditions.push(sql`so.university_id = ${parseInt(universityId)}`);
      if (facultyId) conditions.push(sql`so.faculty_id = ${parseInt(facultyId)}`);
      if (city) conditions.push(sql`u.city = ${city}`);
      if (minPrice) conditions.push(sql`so.price >= ${parseFloat(minPrice)}`);
      if (maxPrice) conditions.push(sql`so.price <= ${parseFloat(maxPrice)}`);
      if (startDate) conditions.push(sql`so.start_date >= ${startDate}`);
      if (endDate) conditions.push(sql`so.end_date <= ${endDate}`);
      if (hasAvailability === "true") conditions.push(sql`so.current_registrations < so.quota`);
      if (courseCode) conditions.push(sql`so.course_code ILIKE ${"%" + courseCode + "%"}`);
      if (search) conditions.push(sql`(so.course_name ILIKE ${"%" + search + "%"} OR so.course_code ILIKE ${"%" + search + "%"})`);
      
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
          so.created_at,
          u.name as university_name,
          u.city as university_city,
          u.type as university_type,
          f.name as faculty_name,
          usr.first_name || ' ' || usr.last_name as academician_name,
          (so.quota - so.current_registrations) as available_slots
        FROM summer_school_offerings so
        LEFT JOIN universities u ON so.university_id = u.id
        LEFT JOIN faculties f ON so.faculty_id = f.id
        LEFT JOIN academicians a ON so.academician_id = a.id
        LEFT JOIN users usr ON a.user_id = usr.id
        WHERE ${sql.join(conditions, sql` AND `)}
        ORDER BY so.application_deadline ASC, so.start_date ASC
      `;
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
        u.name as university_name,
        u.city as university_city,
        f.name as faculty_name,
        (so.quota - so.current_registrations) as available_slots
      FROM summer_school_offerings so
      LEFT JOIN universities u ON so.university_id = u.id
      LEFT JOIN faculties f ON so.faculty_id = f.id
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
      equivalencyInfo,
      requirements,
    } = req.body;

    // Validasyon
    if (!courseName || !courseCode || !universityId) {
      return res.status(400).json({
        success: false,
        message: "Ders adı, ders kodu ve üniversite gereklidir",
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
        equivalency_info,
        requirements
      )
      VALUES (
        ${courseId || null},
        ${universityId},
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
        ${equivalencyInfo || null},
        ${requirements || null}
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
    res.status(500).json({
      success: false,
      message: "Yaz okulu teklifi oluşturulurken bir hata oluştu",
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

    // Teklifin akademisyene ait olup olmadığını kontrol et
    const offering = await sql`
      SELECT id FROM summer_school_offerings
      WHERE id = ${offeringId} AND academician_id = ${academician[0].id}
    `;

    if (offering.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teklif bulunamadı veya güncelleme yetkiniz yok",
      });
    }

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
        equivalency_info = COALESCE(${updateData.equivalencyInfo}, equivalency_info),
        requirements = COALESCE(${updateData.requirements}, requirements),
        is_active = COALESCE(${updateData.isActive}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${offeringId}
      RETURNING *
    `;

    res.json({
      success: true,
      message: "Teklif başarıyla güncellendi",
      data: updated[0],
    });
  } catch (error) {
    console.error("Teklif güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Teklif güncellenirken bir hata oluştu",
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

