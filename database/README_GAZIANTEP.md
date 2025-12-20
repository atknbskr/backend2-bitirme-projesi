# Gaziantep Yaz Okulu Veritabanı Kurulumu

Bu klasördeki dosyalar Gaziantep odaklı yaz okulu sistemini kurmak için gerekli veritabanı migration'larını içerir.

## 📋 Kurulum Sırası

### 1. Temel Tabloları Oluştur

```sql
-- Neon Dashboard > SQL Editor'de çalıştırın
-- Dosya: createSummerSchoolTables.sql
```

Bu dosya şu tabloları oluşturur:
- `student_failed_courses` - Öğrencilerin başarısız dersler
- `summer_school_offerings` - Yaz okulu teklifleri
- `summer_school_registrations` - Başvurular

### 2. Gaziantep Üniversitelerini Ekle

```sql
-- Neon Dashboard > SQL Editor'de çalıştırın
-- Dosya: addGaziantepUniversities.sql
```

Bu dosya şu üniversiteleri ekler/günceller:
- Hasan Kalyoncu Üniversitesi (HKU)
- Gaziantep Üniversitesi
- Gaziantep İslam Bilim ve Teknoloji Üniversitesi (GİBTÜ)

### 3. Örnek Yaz Okulu Derslerini Ekle

**Seçenek A: SQL ile (Önerilen)**

```sql
-- Neon Dashboard > SQL Editor'de çalıştırın
-- Dosya: addSampleSummerOfferings.sql
```

**Seçenek B: Node.js Script ile**

```bash
cd backend2-bitirme-projesi
node database/seedGaziantepData.js
```

## 📚 Eklenen Dersler

Toplam **36 yaz okulu dersi** 3 farklı üniversitede:

### Matematik Dersleri (8 ders)
- Matematik I (MAT101) - 3 üniversite
- Matematik II (MAT102) - 2 üniversite
- Diferansiyel Denklemler - 2 üniversite
- Lineer Cebir - 1 üniversite

### Fizik Dersleri (4 ders)
- Fizik I (FIZ101) - 2 üniversite
- Fizik II (FIZ102) - 2 üniversite

### Kimya Dersleri (2 ders)
- Genel Kimya (KIM101) - 2 üniversite

### Bilgisayar Mühendisliği (7 ders)
- Veri Yapıları ve Algoritmalar - 2 üniversite
- Algoritmalar - 1 üniversite
- Nesneye Yönelik Programlama - 2 üniversite
- Veritabanı Sistemleri - 2 üniversite

### Zorunlu Dersler (9 ders)
- İngilizce I - 3 üniversite
- İngilizce II - 2 üniversite
- Türk Dili - 2 üniversite
- Atatürk İlkeleri ve İnkılap Tarihi - 2 üniversite

### İşletme/İktisat (6 ders)
- Genel Muhasebe - 2 üniversite
- Mikroekonomi - 2 üniversite
- Makroekonomi - 2 üniversite

## 💰 Ücret Aralıkları

- **Zorunlu Dersler:** ₺280 - ₺400
- **Matematik/Fizik:** ₺420 - ₺550
- **Bilgisayar Mühendisliği:** ₺580 - ₺650
- **İşletme/İktisat:** ₺480 - ₺500

## 📅 Tarihler

- **Başvuru Başlangıç:** 1 Haziran 2024
- **Başvuru Son Tarihi:** 30 Haziran 2024
- **Ders Başlangıç:** 15 Temmuz 2024
- **Ders Bitiş:** 15 Ağustos 2024

## 🎯 Kontenjan

- Ders başına **25-70 kişi** arası kontenjan
- Popüler dersler (İngilizce, Türk Dili): 50-70 kişi
- Teknik dersler (Algoritmalar, Veritabanı): 25-35 kişi

## ⚙️ Önemli Notlar

1. **Akademisyen Hesabı:** Dersler eklenirken mevcut ilk akademisyen hesabı kullanılır. Eğer akademisyen yoksa `NULL` olarak eklenir.

2. **Denklik Bilgisi:** Her ders için hangi üniversitelerin hangi dersleri ile denk olduğu belirtilmiştir.

3. **Gereksinimler:** Bazı dersler için ön koşul dersler tanımlanmıştır (örn: Matematik II için Matematik I başarılı olmalı).

4. **Aktif Durum:** Tüm dersler `is_active = true` olarak eklenir.

## 🔍 Kontrol Sorguları

Verilerin doğru eklenip eklenmediğini kontrol etmek için:

```sql
-- Gaziantep üniversitelerini listele
SELECT * FROM universities WHERE city = 'Gaziantep';

-- Yaz okulu derslerini say
SELECT COUNT(*) FROM summer_school_offerings;

-- Üniversiteye göre ders sayısı
SELECT 
    u.name as university,
    COUNT(so.id) as course_count
FROM universities u
LEFT JOIN summer_school_offerings so ON u.id = so.university_id
WHERE u.city = 'Gaziantep'
GROUP BY u.name;

-- En ucuz ve en pahalı dersler
SELECT course_name, course_code, price 
FROM summer_school_offerings 
ORDER BY price ASC 
LIMIT 5;

SELECT course_name, course_code, price 
FROM summer_school_offerings 
ORDER BY price DESC 
LIMIT 5;
```

## 🚀 Sonraki Adımlar

1. Backend sunucusunu başlatın: `npm start`
2. Mobile uygulamayı başlatın: `npx expo start`
3. Yaz Okulu sekmesine gidin
4. Gaziantep otomatik olarak filtrelenmiş olacak
5. Dersleri görüntüleyin ve başvuru yapın!

## 📱 Mobile App Özellikleri

- ✅ Gaziantep varsayılan olarak seçili gelir
- ✅ 36 farklı yaz okulu dersi görüntülenir
- ✅ Üniversite, fakülte, ücret, tarih filtreleri
- ✅ Kontenjan durumu gösterimi
- ✅ Başvuru sistemi

## 🆘 Sorun Giderme

**Dersler görünmüyor mu?**
- Backend sunucusunun çalıştığından emin olun
- SQL script'lerinin sırayla çalıştırıldığından emin olun
- Tarayıcı konsolunda hata olup olmadığını kontrol edin

**Akademisyen bulunamadı hatası?**
- Önce bir akademisyen hesabı oluşturun
- Veya SQL script'ini `academician_id = NULL` olarak çalıştırın

**Tarihler geçmiş görünüyor?**
- SQL dosyalarındaki tarihleri güncelleyin
- Veya seed script'teki tarihleri değiştirin

