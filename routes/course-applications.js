const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const courseApplicationController = require("../controllers/courseApplicationController");
const authMiddleware = require("../middleware/auth");

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

// Öğrenci: Derse başvuru yap
// applicationNote opsiyonel olduğu için validation yok - controller'da kontrol ediliyor
router.post(
  "/courses/:id/apply",
  authMiddleware,
  courseApplicationController.applyToCourse
);

// Öğrenci: Kendi başvurularını listele
router.get("/my-applications", authMiddleware, courseApplicationController.getMyApplications);

// Öğrenci: Başvuru durumunu kontrol et
router.get("/courses/:id/check", authMiddleware, courseApplicationController.checkApplication);

// Akademisyen: Bir derse yapılan başvuruları görüntüle
router.get("/courses/:id/applications", authMiddleware, courseApplicationController.getCourseApplications);

// Akademisyen: Tüm derslerine yapılan başvuruları görüntüle
router.get("/my-courses-applications", authMiddleware, courseApplicationController.getMyCoursesApplications);

// Akademisyen: Başvuru durumunu güncelle (onayla/reddet)
router.put(
  "/:id/status",
  authMiddleware,
  [
    body("status").notEmpty().isIn(["approved", "rejected"]).withMessage("Geçerli bir durum gerekli"),
    body("rejectionReason").optional().isString(),
  ],
  validate,
  courseApplicationController.updateApplicationStatus
);

module.exports = router;

