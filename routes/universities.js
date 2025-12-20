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

// Tüm üniversiteleri listele (Herkese açık)
router.get("/", adminController.getAllUniversities);

// Üniversite ekle (Sadece Admin)
router.post(
  "/",
  adminAuth,
  [
    body("name").notEmpty().withMessage("Üniversite adı gerekli"),
  ],
  validate,
  adminController.addUniversity
);

// Üniversite güncelle (Sadece Admin)
router.put(
  "/:id",
  adminAuth,
  adminController.updateUniversity
);

// Üniversite sil (Sadece Admin)
router.delete(
  "/:id",
  adminAuth,
  adminController.deleteUniversity
);

module.exports = router;


