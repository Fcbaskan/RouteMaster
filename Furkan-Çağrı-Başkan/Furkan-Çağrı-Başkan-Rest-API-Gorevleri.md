# Furkan Çağrı Başkan'ın REST API Metotları

**API Test Videosu:** [API Test Videosunu İzle](https://youtu.be/r1zliDBzwsQ)

---

## KULLANICI İŞLEMLERİ (AUTH & USERS)
### 1. Üye Olma (Register)
- **Endpoint:** `POST /auth/register`

- **Açıklama:** Yeni kullanıcıların platforma kayıt olmasını sağlar. Şifreler güvenlik için şifrelenerek saklanır.

- **Request Body:**
```json
{
"username": "gezgin_ruhu",
"email": "kullanici@example.com",
"password": "Guvenli123!",
"firstName": "Ahmet",
"lastName": "Yılmaz"
}
```

- **Response:** `201 Created` - Kullanıcı başarıyla oluşturuldu

### 2. Kullanıcı Girişi (Login)
- **Endpoint:** `POST /auth/login`

- **Açıklama:** Kayıtlı kullanıcıların e-posta ve şifre ile sisteme giriş yapmasını sağlar.

- **Request Body:**
```json
{
"email": "kullanici@example.com",
"password": "Guvenli123!"
}
```

- **Response:** `200 OK` - Giriş başarılı (Kullanıcı bilgileri ve Token döner)

### 3. Kullanıcı Bilgilerini Görüntüleme
- **Endpoint:** `GET /auth/users/{userId}`

- **Açıklama:** Belirli bir kullanıcının profil detaylarını getirir.

- **Path Parameters:** - userId (string, required) - Kullanıcı ID'si

- **Response:** `200 OK` - Kullanıcı bilgileri başarıyla getirildi

### 4. Kullanıcı Bilgilerini Güncelleme
- **Endpoint:** `PUT /auth/users/{userId}`

- **Açıklama:** Kullanıcıların kendi profil bilgilerini güncellemesini sağlar.

- **Request Body:**
```json
{
"displayName": "yılmazahmet",
"email": "ahmety@routemaster.com"
}
```

- **Path Parameters:** - userId (string, required) - Kullanıcı ID'si

- **Response:** `200 OK` - Kullanıcı başarıyla güncellendi

### 5. Şifre Güncelleme
- **Endpoint:** `PUT /auth/users/{userId}/password`

- **Açıklama:** Kullanıcıların kendi şifresini güncellemesini sağlar.

- **Request Body:**
```json
{
"currentPassword": "ahmet123",
"newPassword": "yılmaz123"
}
```

- **Path Parameters:** - userId (string, required) - Kullanıcı ID'si

- **Response:** `200 OK` - Şifre başarıyla güncellendi

### 6. Kullanıcı Silme
- **Endpoint:** `DELETE /auth/users/{userId}`

- **Açıklama:** Kullanıcı hesabını sistemden kalıcı olarak siler.

- **Path Parameters:** - userId (string, required) - Kullanıcı ID'si

- **Response:** `204 No Content` - Kullanıcı başarıyla silindi

## GEZİ YAZILARI (TRAVELOGUES)
### 7. Yeni Gezi Yazısı Ekleme
- **Endpoint:** `POST /travelogues`

- **Açıklama:** Kullanıcının yeni bir rota/gezi yazısı paylaşmasını sağlar.

- **Request Body:**
```json
{
"userId": "65f1a2b3c...",
"title": "Harika Bir Antalya Turu",
"content": "Kaleiçi'nin dar sokaklarında...",
"location": "Antalya"
}
```

- **Response:** `201 Created` - Gezi yazısı başarıyla paylaşıldı

### 8. Tüm Gezi Yazılarını Listeleme
- **Endpoint:** `GET /travelogues`

- **Açıklama:** Platformdaki diğer gezginler tarafından paylaşılmış tüm gezi yazılarını (rotaları) listeler.

- **Response:** `200 OK` - Gezi yazıları listesi başarıyla getirildi

### 9. Gezi Yazısı Detayı Getirme
- **Endpoint:** `GET /travelogues/{id}`

- **Açıklama:** Belirli bir gezi yazısının tüm detaylarını (içerik, yazar, konum) getirir.

- **Path Parameters:** - id (string, required) - Gezi Yazısı ID'si

- **Response:** `200 OK` - Gezi yazısı detayı getirildi

### 10. Gezi Yazısı Güncelleme
- **Endpoint:** `PUT /travelogues/{id}`

- **Açıklama:** Kullanıcının kendi oluşturduğu bir gezi yazısında düzenleme yapmasını sağlar.

- **Request Body:**
```json
{
"title": "Harika Bir Antalya Turu (Güncel)",
"content": "Kaleiçi'ne ek olarak Düden'i de gezdik..."
}
```
- **Path Parameters:** - id (string, required) - Gezi Yazısı ID'si

- **Response:** `200 OK` - Gezi yazısı başarıyla güncellendi

### 11. Gezi Yazısı Silme
- **Endpoint:** `DELETE /travelogues/{id}`

- **Açıklama:** Kullanıcının kendi gezi yazısını platformdan kaldırmasını sağlar.

- **Path Parameters:** - id (string, required) - Gezi Yazısı ID'si

- **Response:** `204 No Content` - Gezi yazısı silindi

## Yazı PUANLAMA
### 12. Yazıyı Puanlama
- **Endpoint:** `POST /ratings/{userId}`

- **Açıklama:** Kullanıcının Yazdığı Yazıya 1-5 arası puan vermesini ve yorum yapmasını sağlar.

- **Request Body:**
```json
{
"userId": "65f1a2b3c...",
"city": "Roma",
"rating": 5,
"comment": "Tarih kokan harika bir şehir."
}
```

- **Response:** `201 Created` - Puanlama eklendi

### 13. Yazı Puan Silme
- **Endpoint:** `POST /ratings/{id}/{userId}`

- **Açıklama:** Kullanıcının Yazısına Verdiği Puanı Silmesini Sağlar.

- **Path Parameters:** - id (string, required) - Gezi Yazısı ID'si - userId (string, required) - Kullanıcı ID'si

- **Response:** `204 No Content` - Puan Silme

## FAVORİLER (FAVORITES)
### 14. Favorilere Ekleme
- **Endpoint:** `POST /favorites`

- **Açıklama:** Kullanıcının beğendiği bir gezi yazısını kendi favori listesine eklemesini sağlar.

- **Request Body:**
```json
{
"userId": "65f1a2b3c...",
"travelogueId": "77a8b9c0d..."
}
```

- **Response:** `201 Created` - Rota favorilere eklendi

### 15. Kullanıcının Favorilerini Listeleme
- **Endpoint:** `GET /favorites/{userId}`

- **Açıklama:** Belirli bir kullanıcının favorilerine eklediği tüm gezi yazılarını getirir.

- **Path Parameters:** - userId (string, required) - Kullanıcı ID'si

- **Response:** `200 OK` - Favori listesi getirildi

### 16. Favorilerden Çıkarma
- **Endpoint:** `DELETE /favorites/{id}`

- **Açıklama:** Kullanıcının daha önce favorilerine eklediği bir gezi yazısını listeden çıkarmasını sağlar.

- **Path Parameters:** - id (string, required) - Favori ID'si

- **Response:** `204 No Content` - Rota favorilerden çıkarıldı
