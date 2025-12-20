const jwt = require("jsonwebtoken");

// Admin middleware - Sadece admin kullanıcılar erişebilir
const adminAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Yetkilendirme token'ı bulunamadı",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Admin kontrolü
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için admin yetkisi gereklidir",
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

module.exports = adminAuth;



