# student_failed_courses Tablosu Kurulum Kılavuzu

## Sorun
Öğrenci başvuruları görüntülenirken şu hata alınıyor:
```
relation "student_failed_courses" does not exist
```

## Çözüm

### Yöntem 1: SQL Dosyasını Çalıştırma (Önerilen)

1. Neon Dashboard'a giriş yapın
2. SQL Editor'ü açın
3. `backend/database/createStudentFailedCourses.sql` dosyasındaki SQL'i kopyalayıp çalıştırın

### Yöntem 2: Node.js Scripti ile Çalıştırma

Terminal'de şu komutu çalıştırın:

```bash
cd backend
node database/createStudentFailedCoursesTableDirect.js
```

veya

```bash
cd backend
node database/createStudentFailedCoursesTable.js
```

## Not

Controller dosyası güncellendi ve artık tablo yoksa bile çalışacak şekilde düzenlendi. Ancak başarısız ders bilgilerini görmek için tabloyu oluşturmanız gerekiyor.

## Tablo Yapısı

- `id`: Primary key
- `student_id`: Öğrenci ID'si (students tablosuna referans)
- `course_name`: Ders adı
- `course_code`: Ders kodu
- `semester`: Dönem
- `academic_year`: Akademik yıl
- `created_at`: Oluşturulma tarihi



