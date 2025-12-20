# 20 Öğrenci Kaydı Oluşturma Kılavuzu

Bu kılavuz, Neon Database'de 20 farklı öğrenci kaydı oluşturmanız için hazırlanmıştır.

## 📋 Oluşturulacak Öğrenciler

Toplam **20 öğrenci** kaydı oluşturulacaktır:

| No | Ad Soyad | E-posta | Okul No | Şifre |
|----|----------|---------|---------|-------|
| 1 | Ahmet Yılmaz | ahmet.yilmaz@ogrenci.edu.tr | 2021001001 | 123456 |
| 2 | Ayşe Kaya | ayse.kaya@ogrenci.edu.tr | 2021001002 | 123456 |
| 3 | Mehmet Demir | mehmet.demir@ogrenci.edu.tr | 2021001003 | 123456 |
| 4 | Fatma Şahin | fatma.sahin@ogrenci.edu.tr | 2021001004 | 123456 |
| 5 | Mustafa Çelik | mustafa.celik@ogrenci.edu.tr | 2021001005 | 123456 |
| 6 | Zeynep Aydın | zeynep.aydin@ogrenci.edu.tr | 2021001006 | 123456 |
| 7 | Ali Özdemir | ali.ozdemir@ogrenci.edu.tr | 2021001007 | 123456 |
| 8 | Elif Arslan | elif.arslan@ogrenci.edu.tr | 2021001008 | 123456 |
| 9 | Hasan Koç | hasan.koc@ogrenci.edu.tr | 2021001009 | 123456 |
| 10 | Emine Kurt | emine.kurt@ogrenci.edu.tr | 2021001010 | 123456 |
| 11 | İbrahim Öztürk | ibrahim.ozturk@ogrenci.edu.tr | 2021001011 | 123456 |
| 12 | Hatice Aksoy | hatice.aksoy@ogrenci.edu.tr | 2021001012 | 123456 |
| 13 | Hüseyin Yıldız | huseyin.yildiz@ogrenci.edu.tr | 2021001013 | 123456 |
| 14 | Merve Yıldırım | merve.yildirim@ogrenci.edu.tr | 2021001014 | 123456 |
| 15 | Yunus Polat | yunus.polat@ogrenci.edu.tr | 2021001015 | 123456 |
| 16 | Seda Doğan | seda.dogan@ogrenci.edu.tr | 2021001016 | 123456 |
| 17 | Burak Can | burak.can@ogrenci.edu.tr | 2021001017 | 123456 |
| 18 | Esra Erdoğan | esra.erdogan@ogrenci.edu.tr | 2021001018 | 123456 |
| 19 | Emre Güneş | emre.gunes@ogrenci.edu.tr | 2021001019 | 123456 |
| 20 | Gamze Kara | gamze.kara@ogrenci.edu.tr | 2021001020 | 123456 |

## 🚀 Yöntem 1: Node.js Script (ÖNERİLEN)

Bu yöntem şifreleri otomatik olarak bcrypt ile hash'ler.

### Adımlar:

1. **Backend klasörüne gidin:**
   ```bash
   cd backend
   ```

2. **Script'i çalıştırın:**
   ```bash
   npm run create-students
   ```

3. **Sonuçları kontrol edin:**
   Script çalıştığında her öğrenci için durum gösterilecektir:
   - ✅ Başarılı kayıtlar
   - ⚠️ Zaten var olan kayıtlar (atlanır)
   - ❌ Hatalı kayıtlar

### Çıktı Örneği:
```
🚀 Öğrenci kayıtları oluşturuluyor...

✅ Ahmet Yılmaz (2021001001) - Başarıyla oluşturuldu
✅ Ayşe Kaya (2021001002) - Başarıyla oluşturuldu
...
============================================================
📊 Özet:
   ✅ Başarılı: 20
   ❌ Hatalı: 0
   📝 Toplam: 20
============================================================

💡 Not: Tüm öğrencilerin şifresi: 123456
```

## 📝 Yöntem 2: SQL Script (Neon Dashboard)

Bu yöntemi doğrudan Neon Dashboard'da kullanabilirsiniz.

### Adımlar:

1. **Neon Dashboard'a gidin:**
   - https://console.neon.tech adresine gidin
   - Projenizi seçin

2. **SQL Editor'ü açın:**
   - Sol menüden "SQL Editor" seçeneğine tıklayın

3. **SQL dosyasını çalıştırın:**
   - `backend/database/insert20Students.sql` dosyasının içeriğini kopyalayın
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın

4. **Sonuçları kontrol edin:**
   - Script'in sonunda öğrenci listesi görüntülenecektir

## ⚠️ Önemli Notlar

1. **Şifre Güvenliği:**
   - Tüm öğrencilerin varsayılan şifresi: `123456`
   - Production ortamında mutlaka güçlü şifreler kullanın!

2. **Çakışma Kontrolü:**
   - Her iki yöntem de mevcut kayıtları kontrol eder
   - Aynı email veya okul numarası varsa kayıt atlanır

3. **Database Bağlantısı:**
   - `.env` dosyanızda `DATABASE_URL` tanımlı olmalı
   - Neon Database bağlantı URL'inizi kullanın

4. **Test Amaçlı:**
   - Bu veriler test/geliştirme amaçlıdır
   - Production ortamında gerçek kullanıcı bilgileri kullanın

## 🔍 Öğrencileri Kontrol Etme

Kayıtları kontrol etmek için aşağıdaki SQL sorgusunu çalıştırabilirsiniz:

```sql
SELECT 
    u.first_name || ' ' || u.last_name as "Öğrenci Adı",
    s.student_number as "Okul No",
    u.email as "E-posta",
    u.created_at as "Kayıt Tarihi"
FROM users u
JOIN students s ON u.id = s.user_id
WHERE u.user_type = 'student'
ORDER BY s.student_number;
```

## 🧪 Test Giriş Yapma

Herhangi bir öğrenci ile giriş yapmak için:

1. **Öğrenci giriş sayfasına gidin:**
   - `campusumer/öğrenci-giriş/öğrenci-giriş.html`

2. **Giriş bilgilerini girin:**
   - Okul Numarası: `2021001001` (veya 2021001002, 2021001003, vb.)
   - Şifre: `123456`

3. **Giriş Yap butonuna tıklayın**

## 📞 Sorun Giderme

### Hata: "Email zaten kayıtlı"
- Bu email daha önce kullanılmış
- Farklı bir email adresi deneyin veya mevcut kaydı silin

### Hata: "Okul numarası zaten kayıtlı"
- Bu okul numarası daha önce kullanılmış
- Farklı bir okul numarası deneyin veya mevcut kaydı silin

### Hata: "Sunucuya bağlanılamadı"
- `.env` dosyanızdaki `DATABASE_URL` kontrol edin
- Neon Database'in aktif olduğundan emin olun
- İnternet bağlantınızı kontrol edin

## 🎯 Sonraki Adımlar

Öğrencileri oluşturduktan sonra:

1. ✅ Öğrenci giriş sayfasında test edin
2. ✅ Favorilere ders eklemeyi deneyin
3. ✅ Profil bilgilerini görüntüleyin
4. ✅ Çıkış yapıp tekrar giriş yapmayı test edin

---

**Not:** Bu kılavuz Neon Database kullanımına göre hazırlanmıştır. Farklı bir PostgreSQL database kullanıyorsanız, bağlantı ayarlarınızı kontrol edin.

