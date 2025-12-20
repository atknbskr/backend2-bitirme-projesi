const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Geçersiz veri",
      errors: errors.array(),
    });
  }
  next();
};

// Admin Kayıt
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Geçerli bir e-posta adresi girin"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Şifre en az 6 karakter olmalı"),
    body("firstName").notEmpty().withMessage("Ad gerekli"),
    body("lastName").notEmpty().withMessage("Soyad gerekli"),
    body("adminCode").notEmpty().withMessage("Admin kodu gerekli"),
  ],
  validate,
  adminController.adminRegister
);

// Admin Giriş
router.post(
  "/login",
  [
    body("adminCode").notEmpty().withMessage("Admin kodu gerekli"),
    body("password").notEmpty().withMessage("Şifre gerekli"),
  ],
  validate,
  adminController.adminLogin
);

// Tüm kullanıcıları listele (Admin)
router.get("/users", adminAuth, adminController.getAllUsers);

// Kullanıcı güncelle (Admin)
router.put("/users/:id", adminAuth, adminController.updateUser);

// Kullanıcı sil (Admin)
router.delete("/users/:id", adminAuth, adminController.deleteUser);

// İstatistikler (Admin)
router.get("/statistics", adminAuth, adminController.getStatistics);

// Üniversite yönetimi
router.get("/universities", adminAuth, adminController.getAllUniversities);
router.post("/universities", adminAuth, adminController.addUniversity);
router.put("/universities/:id", adminAuth, adminController.updateUniversity);
router.delete("/universities/:id", adminAuth, adminController.deleteUniversity);

module.exports = router;



