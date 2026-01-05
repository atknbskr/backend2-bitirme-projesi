const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// İletişim formu gönder
router.post("/send", contactController.sendContactEmail);

module.exports = router;




