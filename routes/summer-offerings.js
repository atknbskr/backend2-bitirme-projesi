const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const summerOfferingController = require("../controllers/summerOfferingController");
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

// Tüm yaz okulu tekliflerini listele (herkese açık - filtreleme ile)
router.get("/", summerOfferingController.getAllOfferings);

// Tek bir teklifi detaylı getir (herkese açık)
router.get("/:id", summerOfferingController.getOfferingById);

// Akademisyenin kendi tekliflerini listele
router.get("/my/offerings", authMiddleware, summerOfferingController.getMyOfferings);

// Yeni teklif oluştur (sadece akademisyen)
router.post(
  "/",
  authMiddleware,
  [
    body("courseName").notEmpty().withMessage("Ders adı gerekli"),
    body("courseCode").notEmpty().withMessage("Ders kodu gerekli"),
    body("universityId").notEmpty().isInt().withMessage("Üniversite ID gerekli"),
    body("startDate").notEmpty().isISO8601().withMessage("Başlangıç tarihi gerekli"),
    body("endDate").notEmpty().isISO8601().withMessage("Bitiş tarihi gerekli"),
    body("applicationDeadline").notEmpty().isISO8601().withMessage("Başvuru son tarihi gerekli"),
    body("price").optional().isFloat({ min: 0 }),
    body("quota").optional().isInt({ min: 1 }),
  ],
  validate,
  summerOfferingController.createOffering
);

// Teklifi güncelle (sadece akademisyen - kendi teklifi)
router.put("/:id", authMiddleware, summerOfferingController.updateOffering);

// Teklifi sil (sadece akademisyen - kendi teklifi)
router.delete("/:id", authMiddleware, summerOfferingController.deleteOffering);

module.exports = router;







