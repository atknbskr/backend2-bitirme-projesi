const jwt = require("jsonwebtoken");

// Akademisyen veya Admin middleware - Her ikisi de erişebilir
const academicianOrAdminAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Yetkilendirme token'ı bulunamadı",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Akademisyen veya Admin kontrolü
    if (decoded.userType !== 'admin' && decoded.userType !== 'academician') {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için akademisyen veya admin yetkisi gereklidir",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Geçersiz token",
    });
  }
};

module.exports = academicianOrAdminAuth;











