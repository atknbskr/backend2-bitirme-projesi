const express = require("express");
const router = express.Router();
const studentCourseController = require("../controllers/studentCourseController");
const authMiddleware = require("../middleware/auth");

// Öğrencinin aldığı dersleri listele
router.get("/my-courses", authMiddleware, studentCourseController.getMyEnrolledCourses);

// Öğrencinin belirli bir dersini görüntüle
router.get("/:id", authMiddleware, studentCourseController.getEnrolledCourse);

// Dersten çıkış yap
router.delete("/:id/withdraw", authMiddleware, studentCourseController.withdrawFromCourse);

module.exports = router;




