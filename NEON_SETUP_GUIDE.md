# 🔐 Neon Database Kurulum Rehberi

## Sorun
```
Error: getaddrinfo ENOTFOUND api.region.aws.neon.tech
```

Bu hata, `.env` dosyanızdaki `DATABASE_URL`'in yanlış veya eksik olduğunu gösterir.

## ✅ Çözüm Adımları

### 1. Neon Console'a Gidin

1. **Neon Dashboard'a gidin:** https://console.neon.tech
2. **Projenizi seçin** (veya yeni bir proje oluşturun)

### 2. Database Connection String'i Alın

1. Dashboard'da projenizi açın
2. **"Connection Details"** veya **"Connection String"** bölümünü bulun
3. **Connection string'i kopyalayın**

Connection string şu formatta olacaktır:
```
postgresql://username:password@ep-xxxx-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

**Örnek:**
```
postgresql://myuser:AbCdEfGh123@ep-cool-morning-12345.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. `.env` Dosyasını Oluşturun/Güncelleyin

Backend klasöründe `.env` dosyasını açın veya oluşturun:

**Yol:** `backend/.env`

**İçerik:**
```env
DATABASE_URL=postgresql://[BURAYA_NEON_CONNECTION_STRING]

JWT_SECRET=campus-summer-secret-key-2024

PORT=3000
```

**Gerçek örnek:**
```env
DATABASE_URL=postgresql://myuser:AbCdEfGh123@ep-cool-morning-12345.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=campus-summer-secret-key-2024

PORT=3000
```

### 4. Server'ı Yeniden Başlatın

Terminal'de:

1. **Ctrl+C** ile mevcut server'ı durdurun
2. Yeniden başlatın:
```bash
npm run dev
```

### 5. Başarılı Bağlantı Mesajı

Server başarılı başlarsa şunu göreceksiniz:
```
🚀 Server http://localhost:3000 adresinde çalışıyor
```

Artık **"fetch failed"** hatası almamalısınız.

---

## 🎯 Öğrencileri Oluşturun

`.env` dosyasını düzelttikten ve server'ı yeniden başlattıktan sonra:

```bash
npm run create-students
```

Bu komut 20 test öğrencisini database'e ekleyecektir.

---

## 🔍 Hala Sorun mu Var?

### Kontrol Listesi:

- [ ] `.env` dosyası `backend/` klasöründe mi?
- [ ] `DATABASE_URL` doğru mu? (Neon Console'dan kopyalandı mı?)
- [ ] `DATABASE_URL`'de boşluk veya ekstra karakter yok mu?
- [ ] Server yeniden başlatıldı mı?
- [ ] İnternet bağlantınız aktif mi?
- [ ] Neon project'iniz aktif mi? (Neon Console'da kontrol edin)

### Test Bağlantısı:

Basit bir test script'i:

```bash
node -e "const sql = require('./config/db'); sql\`SELECT 1\`.then(() => console.log('✅ Bağlantı başarılı!')).catch(e => console.error('❌ Hata:', e.message))"
```

---

## 📞 Yardım

Hala sorun yaşıyorsanız:

1. `.env` dosyanızın içeriğini kontrol edin (şifreyi paylaşmayın!)
2. Neon Console'da project'inizin aktif olduğunu doğrulayın
3. Connection string'in doğru kopyalandığından emin olun

---

**Not:** `.env` dosyası Git'e eklenmez (güvenlik için). Her ortamda (local, production) ayrı ayrı oluşturulmalıdır.












