const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const summerRegistrationController = require("../controllers/summerRegistrationController");
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

// Öğrencinin başvurularını listele
router.get("/my-registrations", authMiddleware, summerRegistrationController.getMyRegistrations);

// Yeni başvuru yap
router.post(
  "/",
  authMiddleware,
  [
    body("offeringId").notEmpty().isInt().withMessage("Teklif ID gerekli"),
    body("failedCourseId").optional().isInt(),
    body("applicationNote").optional().isString(),
  ],
  validate,
  summerRegistrationController.createRegistration
);

// Başvuruyu iptal et
router.delete("/:id", authMiddleware, summerRegistrationController.cancelRegistration);

// Akademisyen: Bir teklife yapılan başvuruları görüntüle
router.get(
  "/offering/:offeringId",
  authMiddleware,
  summerRegistrationController.getOfferingRegistrations
);

// Akademisyen: Başvuru durumunu güncelle
router.put(
  "/:id/status",
  authMiddleware,
  [
    body("status").notEmpty().isIn(["approved", "rejected"]).withMessage("Geçerli bir durum gerekli"),
    body("rejectionReason").optional().isString(),
  ],
  validate,
  summerRegistrationController.updateRegistrationStatus
);

module.exports = router;

