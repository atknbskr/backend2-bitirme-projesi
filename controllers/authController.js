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

// Öğrenci Kayıt
exports.studentRegister = async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentNumber } = req.body;

    // Email kontrolü
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı",
      });
    }

    // Okul numarası kontrolü
    const existingStudent =
      await sql`SELECT id FROM students WHERE student_number = ${studentNumber}`;
    if (existingStudent.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu okul numarası zaten kayıtlı",
      });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Kullanıcıyı oluştur
    const newUser = await sql`
      INSERT INTO users (email, password_hash, user_type, first_name, last_name)
      VALUES (${email}, ${passwordHash}, 'student', ${firstName}, ${lastName})
      RETURNING id, email, user_type, first_name, last_name
    `;

    // Öğrenci kaydı oluştur
    await sql`
      INSERT INTO students (user_id, student_number)
      VALUES (${newUser[0].id}, ${studentNumber})
    `;

    // Token oluştur
    const token = generateToken(newUser[0]);

    res.status(201).json({
      success: true,
      message: "Kayıt başarılı",
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].first_name,
        lastName: newUser[0].last_name,
        userType: "student",
        studentNumber,
      },
    });
  } catch (error) {
    console.error("Öğrenci kayıt hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kayıt sırasında bir hata oluştu",
    });
  }
};

// Öğrenci Giriş
exports.studentLogin = async (req, res) => {
  try {
    const { studentNumber, password } = req.body;

    // Öğrenciyi bul
    const student = await sql`
      SELECT u.id, u.email, u.password_hash, u.user_type, u.first_name, u.last_name, s.student_number
      FROM users u
      JOIN students s ON u.id = s.user_id
      WHERE s.student_number = ${studentNumber}
    `;

    if (student.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Okul numarası veya şifre hatalı",
      });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, student[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Okul numarası veya şifre hatalı",
      });
    }

    // Token oluştur
    const token = generateToken(student[0]);

    res.json({
      success: true,
      message: "Giriş başarılı",
      token,
      user: {
        id: student[0].id,
        email: student[0].email,
        firstName: student[0].first_name,
        lastName: student[0].last_name,
        userType: "student",
        studentNumber: student[0].student_number,
      },
    });
  } catch (error) {
    console.error("Öğrenci giriş hatası:", error);
    res.status(500).json({
      success: false,
      message: "Giriş sırasında bir hata oluştu",
    });
  }
};

// Akademisyen Kayıt
exports.academicianRegister = async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Email kontrolü
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu e-posta adresi zaten kayıtlı",
      });
    }

    // Kullanıcı adı kontrolü
    const existingAcademician =
      await sql`SELECT id FROM academicians WHERE username = ${username}`;
    if (existingAcademician.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Bu kullanıcı adı zaten kayıtlı",
      });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Kullanıcıyı oluştur
    const newUser = await sql`
      INSERT INTO users (email, password_hash, user_type, first_name, last_name)
      VALUES (${email}, ${passwordHash}, 'academician', ${firstName}, ${lastName})
      RETURNING id, email, user_type, first_name, last_name
    `;

    // Akademisyen kaydı oluştur
    await sql`
      INSERT INTO academicians (user_id, username)
      VALUES (${newUser[0].id}, ${username})
    `;

    // Token oluştur
    const token = generateToken(newUser[0]);

    res.status(201).json({
      success: true,
      message: "Kayıt başarılı",
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].first_name,
        lastName: newUser[0].last_name,
        userType: "academician",
        username,
      },
    });
  } catch (error) {
    console.error("Akademisyen kayıt hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kayıt sırasında bir hata oluştu",
    });
  }
};

// Akademisyen Giriş
exports.academicianLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Akademisyeni bul
    const academician = await sql`
      SELECT u.id, u.email, u.password_hash, u.user_type, u.first_name, u.last_name, a.username
      FROM users u
      JOIN academicians a ON u.id = a.user_id
      WHERE a.username = ${username}
    `;

    if (academician.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı adı veya şifre hatalı",
      });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(
      password,
      academician[0].password_hash
    );
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Kullanıcı adı veya şifre hatalı",
      });
    }

    // Token oluştur
    const token = generateToken(academician[0]);

    res.json({
      success: true,
      message: "Giriş başarılı",
      token,
      user: {
        id: academician[0].id,
        email: academician[0].email,
        firstName: academician[0].first_name,
        lastName: academician[0].last_name,
        userType: "academician",
        username: academician[0].username,
      },
    });
  } catch (error) {
    console.error("Akademisyen giriş hatası:", error);
    res.status(500).json({
      success: false,
      message: "Giriş sırasında bir hata oluştu",
    });
  }
};

// Kullanıcı bilgilerini getir (Token ile)
exports.getMe = async (req, res) => {
  try {
    const user = await sql`
      SELECT id, email, user_type, first_name, last_name, created_at
      FROM users
      WHERE id = ${req.user.id}
    `;

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        userType: user[0].user_type,
        createdAt: user[0].created_at,
      },
    });
  } catch (error) {
    console.error("Kullanıcı bilgi hatası:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı bilgileri alınırken hata oluştu",
    });
  }
};
