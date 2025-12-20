const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const favoriteController = require("../controllers/favoriteController");
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

// Öğrencinin favorilerini listele
router.get("/", authMiddleware, favoriteController.getMyFavorites);

// Favoriye ekle
router.post(
  "/",
  authMiddleware,
  [body("courseId").notEmpty().withMessage("Ders ID gerekli")],
  validate,
  favoriteController.addFavorite
);

// Favoriden çıkar
router.delete("/:id", authMiddleware, favoriteController.removeFavorite);

// Favori durumunu kontrol et
router.get("/check/:id", authMiddleware, favoriteController.checkFavorite);

module.exports = router;



