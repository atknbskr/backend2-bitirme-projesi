# Favorites Tablosuna Status Alanı Ekleme

Bu migration, `favorites` tablosuna `status` alanı ekler. Bu alan öğrenci başvurularının durumunu (pending, approved, rejected) tutar.

## 🚀 Çalıştırma Yöntemleri

### Yöntem 1: NPM Script ile (Önerilen)

Backend klasöründe terminal açın ve şu komutu çalıştırın:

```bash
npm run add-status-to-favorites
```

### Yöntem 2: Node.js ile Doğrudan

```bash
node database/runStatusMigration.js
```

### Yöntem 3: Neon Console SQL Editor'de

1. **Neon Console'a gidin:** https://console.neon.tech
2. Projenizi seçin
3. **SQL Editor** sekmesine gidin
4. `addStatusToFavorites.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'e yapıştırın ve **Run** butonuna tıklayın

## ✅ Kontrol

Migration başarılı oldu mu kontrol etmek için:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'favorites' AND column_name = 'status';
```

Eğer sonuç dönerse, migration başarılıdır! ✅

## 📝 Notlar

- Mevcut kayıtlar otomatik olarak `approved` olarak işaretlenir (geriye dönük uyumluluk için)
- Yeni başvurular `pending` olarak başlar
- Akademisyenler başvuruları `approved` veya `rejected` olarak değiştirebilir


