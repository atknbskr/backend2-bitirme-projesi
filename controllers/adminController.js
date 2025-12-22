const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("../config/db");

// JWT Token oluştur
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, userType: user.user_type },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Admin Kayıt (Sadece super admin yapabilir veya ilk admin)
exports.adminRegister = async (req, res) => {
  try {
    const { email, password, firstName, lastName, adminCode, isSuperAdmin } = req.body;

    // Email kontrolü
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı",
      });
    }

    // Admin kodu kontrolü
    const existingAdmin = await sql`SELECT id FROM admins WHERE admin_code = ${adminCode}`;
    if (existingAdmin.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu admin kodu zaten kayıtlı",
      });
    }

    // İlk admin kontrolü (eğer hiç admin yoksa, ilk admin otomatik super admin olur)
    const adminCount = await sql`SELECT COUNT(*) as count FROM admins`;
    const isFirstAdmin = adminCount[0].count === 0;

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Kullanıcıyı oluştur
    const newUser = await sql`
      INSERT INTO users (email, password_hash, user_type, first_name, last_name)
      VALUES (${email}, ${passwordHash}, 'admin', ${firstName}, ${lastName})
      RETURNING id, email, user_type, first_name, last_name
    `;

    // Admin kaydı oluştur
    await sql`
      INSERT INTO admins (user_id, admin_code, is_super_admin)
      VALUES (${newUser[0].id}, ${adminCode}, ${isFirstAdmin || isSuperAdmin || false})
    `;

    // Token oluştur
    const token = generateToken(newUser[0]);

    res.status(201).json({
      success: true,
      message: "Admin kaydı başarılı",
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].first_name,
        lastName: newUser[0].last_name,
        userType: "admin",
        adminCode,
        isSuperAdmin: isFirstAdmin || isSuperAdmin || false,
      },
    });
  } catch (error) {
    console.error("Admin kayıt hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kayıt sırasında bir hata oluştu",
    });
  }
};

// Admin Giriş
exports.adminLogin = async (req, res) => {
  try {
    const { adminCode, password } = req.body;

    // Admini bul
    const admin = await sql`
      SELECT u.id, u.email, u.password_hash, u.user_type, u.first_name, u.last_name, a.admin_code, a.is_super_admin
      FROM users u
      JOIN admins a ON u.id = a.user_id
      WHERE a.admin_code = ${adminCode}
    `;

    if (admin.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Admin kodu veya şifre hatalı",
      });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, admin[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Admin kodu veya şifre hatalı",
      });
    }

    // Token oluştur
    const token = generateToken(admin[0]);

    res.json({
      success: true,
      message: "Giriş başarılı",
      token,
      user: {
        id: admin[0].id,
        email: admin[0].email,
        firstName: admin[0].first_name,
        lastName: admin[0].last_name,
        userType: "admin",
        adminCode: admin[0].admin_code,
        isSuperAdmin: admin[0].is_super_admin,
      },
    });
  } catch (error) {
    console.error("Admin giriş hatası:", error);
    res.status(500).json({
      success: false,
      message: "Giriş sırasında bir hata oluştu",
    });
  }
};

// Tüm kullanıcıları listele (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.email,
        u.user_type,
        u.first_name,
        u.last_name,
        u.created_at,
        CASE 
          WHEN u.user_type = 'student' THEN s.student_number
          WHEN u.user_type = 'academician' THEN a.username
          WHEN u.user_type = 'admin' THEN ad.admin_code
          ELSE NULL
        END as identifier
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN academicians a ON u.id = a.user_id
      LEFT JOIN admins ad ON u.id = ad.user_id
      ORDER BY u.created_at DESC
    `;

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Kullanıcı listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcılar alınırken bir hata oluştu",
    });
  }
};

// Kullanıcı sil (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Kendini silmeye çalışıyor mu kontrol et
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Kendi hesabınızı silemezsiniz",
      });
    }

    // Kullanıcıyı sil (CASCADE ile ilişkili kayıtlar da silinir)
    await sql`DELETE FROM users WHERE id = ${userId}`;

    res.json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
    });
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı silinirken bir hata oluştu",
    });
  }
};

// İstatistikler (Admin)
exports.getStatistics = async (req, res) => {
  try {
    const [students, academicians, admins, courses, favorites, universities] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM students`,
      sql`SELECT COUNT(*) as count FROM academicians`,
      sql`SELECT COUNT(*) as count FROM admins`,
      sql`SELECT COUNT(*) as count FROM courses`,
      sql`SELECT COUNT(*) as count FROM favorites`,
      sql`SELECT COUNT(*) as count FROM universities`.catch(() => [{ count: 0 }]),
    ]);

    res.json({
      success: true,
      statistics: {
        students: parseInt(students[0].count),
        academicians: parseInt(academicians[0].count),
        admins: parseInt(admins[0].count),
        courses: parseInt(courses[0].count),
        favorites: parseInt(favorites[0].count),
        universities: parseInt(universities[0].count),
      },
    });
  } catch (error) {
    console.error("İstatistik hatası:", error);
    res.status(500).json({
      success: false,
      message: "İstatistikler alınırken bir hata oluştu",
    });
  }
};

// Kullanıcı bilgilerini güncelle (Admin)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, identifier } = req.body;

    // Kullanıcıyı bul
    const user = await sql`SELECT id, user_type FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Email kontrolü (başka kullanıcıda kullanılıyor mu?)
    if (email) {
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email} AND id != ${userId}
      `;
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor",
        });
      }
    }

    // Kullanıcı bilgilerini güncelle
    await sql`
      UPDATE users 
      SET 
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        email = COALESCE(${email}, email)
      WHERE id = ${userId}
    `;

    // Identifier'ı güncelle (öğrenci numarası veya kullanıcı adı)
    const userType = user[0].user_type;
    if (identifier) {
      if (userType === 'student') {
        // Öğrenci numarası kontrolü
        const existingStudent = await sql`
          SELECT id FROM students WHERE student_number = ${identifier} AND user_id != ${userId}
        `;
        if (existingStudent.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Bu öğrenci numarası başka bir öğrenci tarafından kullanılıyor",
          });
        }
        await sql`
          UPDATE students 
          SET student_number = ${identifier}
          WHERE user_id = ${userId}
        `;
      } else if (userType === 'academician') {
        // Kullanıcı adı kontrolü
        const existingAcademician = await sql`
          SELECT id FROM academicians WHERE username = ${identifier} AND user_id != ${userId}
        `;
        if (existingAcademician.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Bu kullanıcı adı başka bir akademisyen tarafından kullanılıyor",
          });
        }
        await sql`
          UPDATE academicians 
          SET username = ${identifier}
          WHERE user_id = ${userId}
        `;
      }
    }

    res.json({
      success: true,
      message: "Kullanıcı bilgileri başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Kullanıcı güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı güncellenirken bir hata oluştu",
    });
  }
};

// Tüm üniversiteleri listele
exports.getAllUniversities = async (req, res) => {
  try {
    const { city, type } = req.query;

    let universities;
    if (city || type) {
      universities = await sql`
        SELECT 
          u.*,
          COUNT(DISTINCT a.id) as academician_count,
          COUNT(DISTINCT student_courses.student_id) as student_count
        FROM universities u
        LEFT JOIN academicians a ON u.id = a.university_id
          LEFT JOIN (
          -- Öğrenciler hangi üniversitenin dersini seçmişse o üniversiteye aittir
          SELECT DISTINCT 
            s.id as student_id,
            acad.university_id
          FROM students s
          LEFT JOIN favorites f ON s.id = f.student_id
          LEFT JOIN courses c ON f.course_id = c.id
          LEFT JOIN academicians acad ON c.academician_id = acad.id
          WHERE acad.university_id IS NOT NULL
        ) student_courses ON student_courses.university_id = u.id
        WHERE 1=1
          ${city ? sql`AND u.city = ${city}` : sql``}
          ${type ? sql`AND u.type = ${type}` : sql``}
        GROUP BY u.id
        ORDER BY u.name ASC
      `;
    } else {
      universities = await sql`
        SELECT 
          u.*,
          COUNT(DISTINCT a.id) as academician_count,
          COUNT(DISTINCT student_courses.student_id) as student_count
        FROM universities u
        LEFT JOIN academicians a ON u.id = a.university_id
          LEFT JOIN (
          -- Öğrenciler hangi üniversitenin dersini seçmişse o üniversiteye aittir
          SELECT DISTINCT 
            s.id as student_id,
            acad.university_id
          FROM students s
          LEFT JOIN favorites f ON s.id = f.student_id
          LEFT JOIN courses c ON f.course_id = c.id
          LEFT JOIN academicians acad ON c.academician_id = acad.id
          WHERE acad.university_id IS NOT NULL
        ) student_courses ON student_courses.university_id = u.id
        GROUP BY u.id
        ORDER BY u.name ASC
      `;
    }

    // Şehirleri tekil olarak al (filtreleme için)
    const cities = await sql`
      SELECT DISTINCT city FROM universities
      WHERE city IS NOT NULL
      ORDER BY city ASC
    `;

    res.json({
      success: true,
      universities: universities.map(u => ({
        ...u,
        academician_count: parseInt(u.academician_count) || 0,
        student_count: parseInt(u.student_count) || 0
      })),
      cities: cities.map(c => c.city),
    });
  } catch (error) {
    console.error("Üniversite listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Üniversiteler alınırken bir hata oluştu",
    });
  }
};

// Üniversite ekle
exports.addUniversity = async (req, res) => {
  try {
    const { name, city, type, website, description, logoUrl, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Üniversite adı gerekli",
      });
    }

    // Aynı isimde üniversite var mı kontrol et
    const existing = await sql`
      SELECT id FROM universities WHERE name = ${name}
    `;
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu isimde bir üniversite zaten kayıtlı",
      });
    }

    // Type'ı normalize et (küçük harf ve Türkçe karakterlerle)
    const normalizedType = (type || 'devlet').toLowerCase();

    const newUniversity = await sql`
      INSERT INTO universities (name, city, type, website, description, logo_url, email, phone)
      VALUES (${name}, ${city || null}, ${normalizedType}, ${website || null}, ${description || null}, 
              ${logoUrl || null}, ${contactEmail || null}, ${contactPhone || null})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: "Üniversite başarıyla eklendi",
      university: newUniversity[0],
    });
  } catch (error) {
    console.error("Üniversite ekleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Üniversite eklenirken bir hata oluştu",
    });
  }
};

// Üniversite güncelle
exports.updateUniversity = async (req, res) => {
  try {
    const universityId = req.params.id;
    const { name, city, type, website, description, logoUrl, contactEmail, contactPhone } = req.body;

    // Üniversite var mı kontrol et
    const university = await sql`
      SELECT id FROM universities WHERE id = ${universityId}
    `;
    if (university.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Üniversite bulunamadı",
      });
    }

    // Aynı isimde başka üniversite var mı kontrol et
    if (name) {
      const existing = await sql`
        SELECT id FROM universities WHERE name = ${name} AND id != ${universityId}
      `;
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Bu isimde bir üniversite zaten kayıtlı",
        });
      }
    }

    // Type'ı normalize et (küçük harf ve Türkçe karakterlerle)
    const normalizedType = type ? type.toLowerCase() : null;

    await sql`
      UPDATE universities 
      SET 
        name = COALESCE(${name}, name),
        city = COALESCE(${city}, city),
        type = COALESCE(${normalizedType}, type),
        website = COALESCE(${website}, website),
        description = COALESCE(${description}, description),
        logo_url = COALESCE(${logoUrl}, logo_url),
        email = COALESCE(${contactEmail}, email),
        phone = COALESCE(${contactPhone}, phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${universityId}
    `;

    res.json({
      success: true,
      message: "Üniversite başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Üniversite güncelleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Üniversite güncellenirken bir hata oluştu",
    });
  }
};

// Üniversite sil
exports.deleteUniversity = async (req, res) => {
  try {
    const universityId = req.params.id;

    await sql`DELETE FROM universities WHERE id = ${universityId}`;

    res.json({
      success: true,
      message: "Üniversite başarıyla silindi",
    });
  } catch (error) {
    console.error("Üniversite silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Üniversite silinirken bir hata oluştu",
    });
  }
};

// Akademisyene üniversite ata
exports.assignUniversityToAcademician = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { universityId } = req.body;

    // Kullanıcının akademisyen olup olmadığını kontrol et
    const academician = await sql`
      SELECT id FROM academicians WHERE user_id = ${userId}
    `;

    if (academician.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Akademisyen bulunamadı",
      });
    }

    // Üniversite var mı kontrol et
    if (universityId) {
      const university = await sql`
        SELECT id FROM universities WHERE id = ${universityId}
      `;
      if (university.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Üniversite bulunamadı",
        });
      }
    }

    // Üniversiteyi ata (null ise kaldır)
    await sql`
      UPDATE academicians 
      SET university_id = ${universityId || null}
      WHERE user_id = ${userId}
    `;

    res.json({
      success: true,
      message: universityId 
        ? "Üniversite başarıyla atandı" 
        : "Üniversite ataması kaldırıldı",
    });
  } catch (error) {
    console.error("Üniversite atama hatası:", error);
    res.status(500).json({
      success: false,
      message: "Üniversite atanırken bir hata oluştu",
    });
  }
};

// Akademisyenleri üniversite bilgileriyle listele
exports.getAcademicians = async (req, res) => {
  try {
    const academicians = await sql`
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        a.username,
        a.university_id,
        uni.name as university_name,
        u.created_at
      FROM users u
      JOIN academicians a ON u.id = a.user_id
      LEFT JOIN universities uni ON a.university_id = uni.id
      WHERE u.user_type = 'academician'
      ORDER BY u.created_at DESC
    `;

    res.json({
      success: true,
      academicians,
    });
  } catch (error) {
    console.error("Akademisyen listeleme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Akademisyenler alınırken bir hata oluştu",
    });
  }
};


