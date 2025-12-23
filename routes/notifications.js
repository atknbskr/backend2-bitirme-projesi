const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth");

// Kullanıcının bildirimlerini getir
router.get("/", authMiddleware, notificationController.getMyNotifications);

// Okunmamış bildirim sayısını getir
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

// Bildirimi okundu olarak işaretle
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

module.exports = router;

