const nodemailer = require("nodemailer");

// E-posta transporter'ı oluştur
const createTransporter = () => {
  // Eğer .env'de SMTP ayarları varsa kullan
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Gmail için ayarlar
  else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Gmail App Password'un boşluk içermediğinden emin ol
    const appPassword = process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '');

    if (appPassword.length !== 16) {
      console.warn("⚠️ UYARI: Gmail App Password 16 karakter olmalıdır. Mevcut uzunluk:", appPassword.length);
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER.trim(),
        pass: appPassword,
      },
    });
  }
  // Hiçbir ayar yoksa null döndür
  else {
    return null;
  }
};

// İletişim formu gönder
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, recipient, subject, message } = req.body;

    // Validasyon
    if (!name || !email || !recipient || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Lütfen tüm zorunlu alanları doldurun",
      });
    }

    // E-posta adreslerini belirle
    let recipients = [];
    if (recipient === "both") {
      recipients = [
        "atakan.baskir@std.hku.edu.tr",
        "yusuf.tiken@std.hku.edu.tr",
      ];
    } else {
      recipients = [recipient];
    }

    // E-posta içeriği
    const emailContent = `
Merhaba,

Aşağıdaki mesaj Campus Summer iletişim formundan gönderilmiştir:

---
Gönderen Bilgileri:
Ad Soyad: ${name}
E-posta: ${email}
Telefon: ${phone || "Belirtilmemiş"}

Konu: ${subject}

Mesaj:
${message}
---

Bu mesaj otomatik olarak gönderilmiştir. Lütfen gönderenin e-posta adresine doğrudan yanıt verebilirsiniz.
`;

    // E-posta transporter'ı oluştur
    const transporter = createTransporter();

    // E-posta ayarları kontrolü
    if (!transporter) {
      console.error("E-posta ayarları bulunamadı! Lütfen .env dosyasına GMAIL_USER ve GMAIL_APP_PASSWORD veya SMTP ayarlarını ekleyin.");
      return res.status(500).json({
        success: false,
        message: "E-posta servisi yapılandırılmamış. Lütfen sistem yöneticisine başvurun.",
        error: "E-posta ayarları eksik. backend/EMAIL_SETUP.md dosyasına bakın.",
      });
    }

    // Her alıcıya ayrı ayrı gönder
    const emailPromises = recipients.map((to) => {
      return transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.GMAIL_USER || `"Campus Summer" <noreply@campussummer.com>`,
        to: to,
        replyTo: email, // Yanıtlar gönderenin e-postasına gitsin
        subject: `[Campus Summer İletişim] ${subject}`,
        text: emailContent,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Campus Summer İletişim Formu</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #212529; margin-top: 0;">Gönderen Bilgileri</h3>
              <p><strong>Ad Soyad:</strong> ${name}</p>
              <p><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Telefon:</strong> ${phone || "Belirtilmemiş"}</p>
            </div>
            <div style="background: #fff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #212529; margin-top: 0;">Konu: ${subject}</h3>
              <p style="color: #495057; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
              <p>Bu mesaj otomatik olarak gönderilmiştir. Lütfen gönderenin e-posta adresine doğrudan yanıt verebilirsiniz.</p>
            </div>
          </div>
        `,
      });
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: "Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.",
    });
  } catch (error) {
    console.error("E-posta gönderme hatası:", error);

    // Gmail kimlik doğrulama hatası için özel mesaj
    let errorMessage = "E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";

    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = "Gmail kimlik doğrulama hatası! Lütfen .env dosyasındaki GMAIL_USER ve GMAIL_APP_PASSWORD değerlerini kontrol edin. Gmail App Password kullanmanız gerekiyor (normal şifre çalışmaz). Detaylar için backend/EMAIL_SETUP.md dosyasına bakın.";
      console.error("Gmail kimlik doğrulama hatası - Muhtemel nedenler:");
      console.error("1. Gmail App Password kullanılmıyor (normal şifre kullanılıyor)");
      console.error("2. Gmail App Password yanlış veya eksik");
      console.error("3. 2 Adımlı Doğrulama açık değil");
      console.error("4. .env dosyasında GMAIL_USER veya GMAIL_APP_PASSWORD eksik/yanlış");
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = "E-posta sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? {
        code: error.code,
        message: error.message,
        response: error.response
      } : undefined,
    });
  }
};

