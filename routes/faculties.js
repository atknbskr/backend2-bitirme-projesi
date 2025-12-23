const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const facultyController = require("../controllers/facultyController");
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

// Tüm fakülteleri listele (herkese açık)
router.get("/", facultyController.getAllFaculties);

// Akademisyenin kendi fakültelerini listele
router.get("/my-faculties", authMiddleware, facultyController.getMyFaculties);

// Yeni fakülte ekle (sadece akademisyen veya admin)
router.post(
  "/",
  academicianOrAdminAuth,
  [
    body("name").notEmpty().withMessage("Fakülte adı gerekli"),
    body("description").optional().isString(),
    body("universityId").optional().isInt(),
  ],
  validate,
  facultyController.createFaculty
);

// Fakülte sil (sadece akademisyen veya admin)
router.delete("/:id", academicianOrAdminAuth, facultyController.deleteFaculty);

module.exports = router;













