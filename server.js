const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const favoriteRoutes = require("./routes/favorites");
const adminRoutes = require("./routes/admin");
const universityRoutes = require("./routes/universities");
const facultyRoutes = require("./routes/faculties");
const summerOfferingsRoutes = require("./routes/summer-offerings");
const summerRegistrationsRoutes = require("./routes/summer-registrations");
const announcementRoutes = require("./routes/announcements");
const studentCoursesRoutes = require("./routes/student-courses");

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

// Ana giriş sayfasına yönlendir
app.get("/", (_req, res) => {
  res.redirect("/website-giriş-sayfası/website-giriş-sayfası.html");
});

// Statik dosyaları servis et (frontend)
app.use(express.static(path.join(__dirname, "../campusumer")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/summer-offerings", summerOfferingsRoutes);
app.use("/api/summer-registrations", summerRegistrationsRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/student-courses", studentCoursesRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Campus Summer API çalışıyor!" });
});

// Database test endpoint
app.get("/api/test/db", async (req, res) => {
  try {
    const sql = require("./config/db");
    // Test query
    const result = await sql`SELECT 1 as test`;
    res.json({ 
      status: "OK", 
      message: "Veritabanı bağlantısı başarılı",
      test: result[0]
    });
  } catch (error) {
    res.status(500).json({ 
      status: "ERROR", 
      message: "Veritabanı bağlantı hatası",
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Sunucu hatası oluştu",
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server http://0.0.0.0:${PORT} adresinde çalışıyor`);
  console.log(`📱 Android emülatör için: http://10.0.2.2:${PORT}`);
  console.log(`💻 Localhost için: http://localhost:${PORT}`);
});
