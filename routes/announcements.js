const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const announcementController = require("../controllers/announcementController");
const authMiddleware = require("../middleware/auth");
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

// Duyuruları getir (Public - query ile filtrelenebilir)
router.get("/", announcementController.getAnnouncements);

// Tüm duyuruları getir (Admin/Akademisyen için)
router.get("/all", academicianOrAdminAuth, announcementController.getAllAnnouncements);

// Yeni duyuru oluştur (Admin/Akademisyen)
router.post(
  "/",
  academicianOrAdminAuth,
  [
    body("title").notEmpty().withMessage("Başlık gerekli"),
    body("content").notEmpty().withMessage("İçerik gerekli"),
    body("targetAudience")
      .isIn(["student", "academician", "all"])
      .withMessage("Geçersiz hedef kitle"),
  ],
  validate,
  announcementController.createAnnouncement
);

// Duyuru güncelle (Admin/Akademisyen)
router.put(
  "/:id",
  academicianOrAdminAuth,
  [
    body("title").notEmpty().withMessage("Başlık gerekli"),
    body("content").notEmpty().withMessage("İçerik gerekli"),
    body("targetAudience")
      .isIn(["student", "academician", "all"])
      .withMessage("Geçersiz hedef kitle"),
  ],
  validate,
  announcementController.updateAnnouncement
);

// Duyuru sil (Admin/Akademisyen)
router.delete("/:id", academicianOrAdminAuth, announcementController.deleteAnnouncement);

module.exports = router;





