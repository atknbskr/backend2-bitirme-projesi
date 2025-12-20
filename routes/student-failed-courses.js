const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const studentFailedCourseController = require("../controllers/studentFailedCourseController");
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

// Öğrencinin başarısız derslerini listele
router.get("/", authMiddleware, studentFailedCourseController.getMyFailedCourses);

// Yeni başarısız ders ekle
router.post(
  "/",
  authMiddleware,
  [
    body("courseName").notEmpty().withMessage("Ders adı gerekli"),
    body("courseCode").optional().isString(),
    body("semester").optional().isString(),
    body("academicYear").optional().isString(),
  ],
  validate,
  studentFailedCourseController.addFailedCourse
);

// Başarısız ders sil
router.delete("/:id", authMiddleware, studentFailedCourseController.deleteFailedCourse);

module.exports = router;

