# 📧 E-posta Gönderme Kurulum Rehberi

Campus Summer iletişim formunun çalışması için e-posta gönderme servisi yapılandırması gereklidir.

## ⚠️ ÖNEMLİ: "Missing credentials" Hatası

Eğer "Missing credentials for 'PLAIN'" hatası alıyorsanız, `.env` dosyanızda e-posta ayarları eksiktir. Aşağıdaki adımları takip edin.

## 🔧 Hızlı Kurulum (Gmail)

### 1. Nodemailer Paketini Yükleyin

```bash
cd backend
npm install
```

### 2. .env Dosyasını Oluşturun/Güncelleyin

`backend` klasöründe `.env` dosyası oluşturun veya mevcut dosyayı açın ve şu satırları ekleyin:

### 3. E-posta Servisi Seçenekleri

#### Seçenek A: Gmail (Önerilen - Kolay)

1. **Gmail hesabınızda 2 Adımlı Doğrulamayı açın:**
   - https://myaccount.google.com/security
   - "2 Adımlı Doğrulama"yı etkinleştirin

2. **Uygulama Şifresi oluşturun:**
   - https://myaccount.google.com/apppasswords adresine gidin
   - "Uygulama" seçin: "Mail"
   - "Cihaz" seçin: "Diğer (Özel ad)" → "Campus Summer" yazın
   - "Oluştur" butonuna tıklayın
   - **16 haneli şifreyi kopyalayın** (örnek: `abcd efgh ijkl mnop`)
   - ⚠️ **ÖNEMLİ:** Şifreyi kopyalarken boşlukları kaldırın veya `.env` dosyasında boşluksuz yazın

3. **`.env` dosyasına ekleyin:**

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**⚠️ ÖNEMLİ NOTLAR:**
- **Normal Gmail şifresi ÇALIŞMAZ!** Mutlaka App Password kullanmalısınız
- App Password 16 karakter olmalıdır (boşluksuz)
- Eğer "Username and Password not accepted" hatası alıyorsanız:
  1. App Password'u tekrar oluşturun
  2. `.env` dosyasındaki değerleri kontrol edin (tırnak işareti olmamalı)
  3. Server'ı yeniden başlatın
  4. 2 Adımlı Doğrulama'nın açık olduğundan emin olun

#### Seçenek B: Özel SMTP Servisi

Eğer kendi SMTP sunucunuzu kullanmak istiyorsanız:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM="Campus Summer" <noreply@campussummer.com>
```

**Popüler SMTP Servisleri:**
- **Gmail:** `smtp.gmail.com` (Port: 587)
- **Outlook/Hotmail:** `smtp-mail.outlook.com` (Port: 587)
- **Yahoo:** `smtp.mail.yahoo.com` (Port: 587)
- **SendGrid:** `smtp.sendgrid.net` (Port: 587)
- **Mailgun:** `smtp.mailgun.org` (Port: 587)

### 4. `.env` Dosyası Örneği

```env
# Veritabanı
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# Port
PORT=5500

# E-posta Ayarları (Gmail için)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# VEYA Özel SMTP için
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password
# SMTP_FROM="Campus Summer" <noreply@campussummer.com>
```

### 5. Server'ı Yeniden Başlatın

```bash
npm run dev
```

## ✅ Test Etme

1. İletişim sayfasına gidin: `http://localhost:5500/İletişim/iletisim.html`
2. Formu doldurun ve gönderin
3. E-posta kutunuzu kontrol edin

## 🔍 Sorun Giderme

### "E-posta gönderilirken bir hata oluştu" hatası

1. **Gmail App Password kontrolü:**
   - App Password'un doğru kopyalandığından emin olun (boşluksuz)
   - 2 Adımlı Doğrulama'nın açık olduğundan emin olun

2. **SMTP ayarları kontrolü:**
   - `.env` dosyasındaki değerlerin doğru olduğundan emin olun
   - Port numarasının doğru olduğundan emin olun

3. **Firewall/Güvenlik:**
   - Bazı ağlarda SMTP portları engellenmiş olabilir
   - Port 587 veya 465'in açık olduğundan emin olun

4. **Console log kontrolü:**
   - Backend console'da hata mesajlarını kontrol edin
   - `NODE_ENV=development` ile daha detaylı hata mesajları alabilirsiniz

## 📝 Notlar

- Gmail günlük gönderim limiti: 500 e-posta/gün (kişisel hesap)
- Üretim ortamında profesyonel bir e-posta servisi (SendGrid, Mailgun, AWS SES) kullanmanız önerilir
- Gmail App Password sadece Gmail için geçerlidir, diğer servisler için normal şifre kullanılır

