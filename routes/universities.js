const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const adminController = require("../controllers/adminController");
const academicianOrAdminAuth = require("../middleware/academicianOrAdminAuth");

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

// Tüm üniversiteleri listele (Herkese açık)
router.get("/", adminController.getAllUniversities);

// Üniversite ekle (Akademisyen veya Admin)
router.post(
  "/",
  academicianOrAdminAuth,
  [
    body("name").notEmpty().withMessage("Üniversite adı gerekli"),
  ],
  validate,
  adminController.addUniversity
);

// Üniversite güncelle (Akademisyen veya Admin)
router.put(
  "/:id",
  academicianOrAdminAuth,
  adminController.updateUniversity
);

// Üniversite sil (Akademisyen veya Admin)
router.delete(
  "/:id",
  academicianOrAdminAuth,
  adminController.deleteUniversity
);

module.exports = router;

