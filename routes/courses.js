const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const courseController = require("../controllers/courseController");
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

// Tüm dersleri listele (herkese açık)
router.get("/", courseController.getAllCourses);

// Ders detaylarını getir (herkese açık)
router.get("/:id/details", courseController.getCourseDetails);

// Akademisyenin kendi derslerini listele
router.get("/my-courses", authMiddleware, courseController.getMyCourses);

// Akademisyenin derslerini öğrencilerle birlikte listele
router.get("/my-courses-with-students", authMiddleware, courseController.getMyCoursesWithStudents);

// Derse kayıtlı öğrencileri getir (sadece akademisyen - kendi dersleri)
router.get("/:id/students", authMiddleware, courseController.getCourseStudents);

// Yeni ders ekle (sadece akademisyen)
router.post(
  "/",
  authMiddleware,
  [
    body("courseName").notEmpty().withMessage("Ders adı gerekli"),
    body("category").optional().isString(),
  ],
  validate,
  courseController.createCourse
);

// Ders sil (sadece akademisyen - kendi dersleri)
router.delete("/:id", authMiddleware, courseController.deleteCourse);

module.exports = router;



