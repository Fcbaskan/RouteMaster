# Furkan Çağrı Başkan'ın Web Frontend Görevleri

**Front-end Test Videosu:** [Front-end Test Videosunu İzle](https://www.youtube.com/watch?v=fFpWMDKhJjo)

---

## 1. Üye Olma ve Giriş (Karşılama) Ekranı
- **API Endpoints:** `POST /auth/register` ve `POST /auth/login`
- **Görev:** Kullanıcı kayıt ve giriş işlemleri için "Glassmorphism" (Buzlu Cam) konseptli, tek sayfada çalışan (Single Page Application hissiyatlı) dinamik web arayüzü tasarımı ve entegrasyonu.
- **UI Bileşenleri:**
  - Full-screen yüksek çözünürlüklü dinamik arka plan manzarası.
  - Yarı şeffaf, blur efektli form kartları (Glass Panel).
  - Ad, Soyad, Kullanıcı Adı, E-posta ve Şifre input alanları (Karanlık tema uyumlu).
  - Formlar arası pürüzsüz geçiş sağlayan yönlendirme linkleri ("Zaten üye misiniz? Giriş yapın").
  - Özel tasarımlı Gradient "Aramıza Katıl" ve "Giriş Yap" butonları.
  - Tarayıcı standart `alert()` yerine ekrana animasyonla gelen Özel Uyarı Penceresi (Custom Modal).
- **Form Validasyonu:**
  - HTML5 native validation özellikleri (`required`, `type="email"`).
  - Benzersiz veriler için Server-side hata yakalama (Örn: "Bu kullanıcı adı kullanımda" MongoDB 11000 hatası).
- **Kullanıcı Deneyimi:**
  - Başarılı kayıt işleminden sonra formun (`reset()`) temizlenerek kullanıcıyı yormadan otomatik olarak "Giriş Yap" paneline kaydırması.
  - Giriş yapıldığında `localStorage`'a ID'nin kaydedilip doğrudan "Dashboard" (Ana Sayfa) arayüzüne yönlendirme.
  - Hata durumlarında ekranı dondurmayan, şık ikonlu (✅, ❌) geri bildirimler.
- **Teknik Detaylar:**
  - Framework: Vanilla JavaScript, HTML5 ve Custom CSS.
  - State Management: `localStorage` ("aktif_kullanici_id") üzerinden yerel oturum yönetimi.
  - DOM Manipulation: `classList.remove('hidden')` ile sayfayı yenilemeden formlar arası akıcı geçiş.
  - API Entegrasyonu: Asenkron Fetch API ve `try-catch` blokları ile güvenli veri transferi.

## 2. Kullanıcı Profil Görüntüleme ve Düzenleme Sayfası
- **API Endpoints:** `GET /auth/users/{userId}` ve `PUT /auth/users/{userId}` (Şifre için: `PUT /auth/users/{userId}/password`)
- **Görev:** Kullanıcının mevcut hesap bilgilerini görüntüleyebildiği, kişisel bilgilerini ve şifresini güvenle güncelleyebildiği bir "Hesap Ayarları Merkezi" oluşturulması.
- **UI Bileşenleri:**
  - RouteMaster premium tasarım diline uygun, cam efektli "Profil Ayarları" ve "Şifre Değiştirme" form panelleri.
  - Input alanlarının varsayılan olarak kullanıcının mevcut verileriyle dolu gelmesi.
  - "Değişiklikleri Kaydet" (Primary) ve "Şifreyi Güncelle" butonları.
  - Profil sayfasından ana menüye dönmeyi sağlayan şık, üst sabit navigasyon barı (Navbar).
- **Form Validasyonu:**
  - Eski şifre ve yeni şifre eşleşme/doğrulama kontrolleri (Backend destekli).
  - E-posta formati ve boş veri kontrolleri.
- **Kullanıcı Deneyimi:**
  - Sayfa açıldığı an `profilGetir()` fonksiyonu ile verilerin arka planda yüklenip saniyeler içinde input kutularına yerleşmesi (Optimistic Data Fetching).
  - Bilgiler güncellendiğinde sayfa yenilenmesine gerek kalmadan anında başarılı olduğuna dair bildirim verilmesi.
- **Teknik Detaylar:**
  - `window.onload` anında kullanıcının giriş yapıp yapmadığını denetleyen `checkAuth()` güvenlik kalkanı (Route Guarding).
  - JSON paketleme (`JSON.stringify`) ile Ad, Soyad ve Kullanıcı Adı verilerinin backend'e hatasız iletimi.
  - Hata yakalama (Örn: Başkasının aldığı bir kullanıcı adını denerse 409 Conflict yakalama).

## 3. Hesap Silme Akışı
- **API Endpoint:** `DELETE /auth/users/{userId}`
- **Görev:** Kullanıcının sistemdeki tüm verilerini (Gezi yazıları, favorileri, profili) kalıcı olarak silmesini sağlayan güvenli çıkış akışının kodlanması.
- **UI Bileşenleri:**
  - Profil sayfasının en altında konumlandırılmış kırmızı, dikkat çekici "Hesabı Sil" butonu.
  - Kritik işlemlere özel tarayıcı tabanlı onay (Confirmation) diyalogları.
- **Kullanıcı Deneyimi:**
  - "Yanlışlıkla tıklama" ihtimalini sıfıra indirmek için tasarlanmış Çift Onay Mekanizması (1. "Emin misiniz?" -> 2. "Bu işlem geri alınamaz, siliyorum?").
  - Başarılı silme işleminden sonra "Elveda" mesajı ile kullanıcının sistemsel bağlarının koparılması.
- **Akış Adımları:**
  - Kullanıcı "Hesabımı Sil" butonuna tıklar.
  - Birinci uyarı çıkar: Bilgilerin kaybolacağı hatırlatılır.
  - İkinci güvenlik onayı istenir.
  - Onaylanırsa Backend'e `DELETE` isteği atılır.
  - Tarayıcı önbelleğindeki (`localStorage`) oturum bilgileri temizlenir.
  - Kullanıcı zorunlu olarak `index.html` (Kayıt) sayfasına yönlendirilir.
- **Teknik Detaylar:**
  - Asenkron Fetch ile `DELETE` metodunun kullanılması.
  - Backend'in döndüğü 204 (No Content) veya 200 yanıt statüsüne göre `response.ok` ile başarı kontrolü yapılması.
  - Session temizliği (`localStorage.removeItem`).

## 4. Gezi Yazısı (İçerik) Yönetim Modülü
- **API Endpoints:**
  - `GET /travelogue` (Listeleme)
  - `GET /travelogue/{id}` (Detay Getirme)
  - `POST /travelogue` (Yeni Ekleme)
  - `PUT /travelogue/{id}` (Güncelleme)
  - `DELETE /travelogue/{id}` (Silme)
- **Görev:** Kullanıcıların gezi rotalarını oluşturabildiği, listeleyebildiği, detaylarını okuyabildiği ve kendi yazılarını yönetebildiği uçtan uca içerik sisteminin entegrasyonu.
- **UI Bileşenleri:**
  - Ana Sayfa (Dashboard): Responsive grid mimarisi ile dizilmiş, dinamik resim çeken (Picsum API) Premium Cam Efektli gezi kartları.
  - Ekleme/Düzenleme Formları: Karanlık tema uyumlu, geniş metin alanlarına sahip "İçerik Stüdyosu" hissiyatlı form panelleri.
  - Detay Sayfası: Okyanus manzaralı arka plan üzerine oturan, tam sayfa genişliğinde, yazar, rota ve içerik detaylarını barındıran okuma arayüzü.
- **Kullanıcı Deneyimi (UX):**
  - Resimlerin sayfayı yavaşlatmaması için `loading="lazy"` (Tembel Yükleme) mimarisi.
  - "Düzenle" butonuna tıklandığında `eskiVerileriDoldur()` fonksiyonu ile veritabanındaki verilerin saniyeler içinde inputlara otomatik yerleştirilmesi.
  - Silme işlemi öncesi yanlışlıkları önlemek için `confirm()` ile güvenlik teyidi alınması ve silinen yazının DOM'dan anında kaldırılması (Sayfa yenilemeden).
- **Teknik Detaylar:**
  - URL Parametreleri: Detay ve Düzenle sayfalarına geçişte `URLSearchParams` kullanılarak ID'nin URL üzerinden güvenle taşınması (`?id=12345`).
  - Dinamik Filtreleme: "Benim Yazılarım" sayfasında `Array.filter()` kullanılarak sadece aktif kullanıcının ID'si ile eşleşen yazıların ekrana basılması.

## 5. Favori Sistemi (Bookmark)
- **API Endpoints:**
  - `POST /favorites` (Ekleme)
  - `GET /favorites/{userId}` (Listeleme)
  - `DELETE /favorites/{itemId}/{userId}` (Çıkarma)
- **Görev:** Kullanıcıların beğendikleri rotaları kaydedip daha sonra ulaşabilecekleri kişiselleştirilmiş "Favorilerim" altyapısının kurulması.
- **UI Bileşenleri:**
  - Gezi kartları üzerinde konumlandırılmış interaktif "❤️ Favori" butonları.
  - Favoriye eklenmiş yazılara özel listeleme sayfası.
  - Listeden çıkarma işlemi için özel "❌ Favorilerden Çıkar" butonları.
- **Kullanıcı Deneyimi (UX):**
  - Optimistic UI (İyimser Arayüz): Favoriye ekle butonuna basıldığında ekrana rahatsız edici `alert()` çıkarmak yerine, butonun renginin anında yeşile dönmesi ve metnin "✅ Favorilere Eklendi" olarak değişmesi.
  - Zaten favorilerde olan bir yazıya tekrar tıklandığında butonun sarı renge dönerek kullanıcıyı uyarması.
  - Favorilerden çıkarma işlemi yapıldığında listenin anında `fetchFavorites()` ile kendini güncelleyerek silinen öğeyi ekrandan kaybetmesi.
- **Teknik Detaylar:**
  - İstek atılırken Buton DOM elementinin (`this`) fonksiyona parametre olarak geçirilerek sadece tıklanan butonun CSS stilinin JavaScript ile anında manipüle edilmesi.

## 6. İnteraktif Puanlama (Rating) Sistemi
- **API Endpoints:**
  - `POST /ratings/{yaziId}` (Puan Verme)
  - `DELETE /ratings/{yaziId}/{userId}` (Puan Silme)
- **Görev:** Topluluk etkileşimini artırmak için gezi yazılarına 5 yıldız üzerinden puan verilmesini sağlayan dinamik derecelendirme modülünün geliştirilmesi.
- **UI Bileşenleri:**
  - Font boyutlarıyla ayarlanmış, fare ile üzerine gelindiğinde tepki veren 5'li yıldız (☆/★) komponenti.
  - Puanı sıfırlamak için tasarlanmış minimalist silme butonu.
- **Kullanıcı Deneyimi (UX):**
  - Bağlamsal Görünüm: Ana sayfadaki (Dashboard) yıldızların sadece ortalama puanı göstermesi (tıklanamaz olması) ile sadeliğin korunması.
  - Detay sayfasına girildiğinde yıldızların interaktif hale gelmesi ve kullanıcının verdiği puana göre (örneğin 3'e basıldığında ilk 3 yıldızın) anında sarı renge (`#ffc107`) boyanması.
  - Puan silindiğinde ekran yenilenmesine gerek kalmadan tüm yıldızların tekrar gri boş yıldıza (☆) dönmesi.
- **Teknik Detaylar:**
  - DOM İterasyonu: Verilen puan sayısına göre JavaScript `for` döngüsü kullanılarak `NodeList` (yıldız elemanları) üzerinde anlık renk ve karakter (`innerText`) değişimi.
  - Backend'den gelen `averageRating` (Ortalama Puan) verisinin `Math.round()` ile tam sayıya yuvarlanarak arayüzdeki yıldızlara hatasız yansıtılması.
