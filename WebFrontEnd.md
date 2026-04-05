# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [frontend.routemaster.com](https://route-master-frontend-gray.vercel.app)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Furkan Çağrı Başkan Web Frontend Görevleri](Furkan-Çağrı-Başkan/Furkan-Çağrı-Başkan-Web-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Mobile-First Approach:** Önce mobil tasarım, sonra desktop.
- **Breakpoints:** Özel Medya Sorguları (@media (max-width: 650px)) ile formların ve grid yapısının mobilde alt alta dizilmesi
- **Flexible Layouts:** CSS Grid (grid-template-columns: repeat(auto-fill, minmax(350px, 1fr))) ve Navbar/Menüler için Flexbox 
- **Visual Optimization:** Unsplash/Picsum API'den gelen resimlerin mobil ekranlarda taşmaması için object-fit: cover ve width: 100% 

### 2. Tasarım Sistemi
- **CSS Framework:** Custom CSS ve Glassmorphism (Buzlu Cam) konsepti (backdrop-filter: blur(15px))
- **Renk Paleti:** Turuncu/Sarı (#ffe066), Gök Mavisi, Kırmızı (#dc3545 - silme/hata işlemleri için) ve Beyaz transparan tonlarının tutarlı kullanımı
- **Tipografi:** Modern ve okunaklı Google Fontu: 'Poppins'
- **Iconography:** Harici ikon kütüphaneleri (FontAwesome vb.) yükleyip siteyi yavaşlatmak yerine, modern ve hızlı Native Emojiler (🌍, 📍, 👤, ❤️, ⭐)
- **Component Library:** Ortak class'lar (.glass-panel, .action-btn, .form-control) ile tekrar kullanılabilir CSS yapıları

### 3. Performans Optimizasyonu
- **Light Architecture:** React veya Vue gibi büyük framework'ler kullanılmadığı için sayfa yüklenme süresi (Load time) sıfıra yakındır
- **Lazy Loading:** Gezi kartlarındaki görsellerde loading="lazy" attribute'u kullanılarak sadece ekranda görünen fotoğrafların yüklenmesinin sağlanması
- **Dynamic Content:** app.js üzerinden sayfalar arası geçişlerde sadece gerekli verilerin (JSON) Vercel'den çekilip DOM'a basılması

### 4. SEO (Search Engine Optimization)
- **Meta Tags:** Her sayfa için özelleştirilmiş başlıklar (Örn: <title>RouteMaster - Keşfet</title>)
- **Dynamic Alt Texts:** Görme engelliler ve arama motorları için resimlerde dinamik alt etiketleri (alt="${yazi.city} manzarası")
- **Semantic Structure:** Navigasyon için <nav>, formlar için <form>, kartlar için mantıklı <h3> ve <p> etiket hiyerarşisi.

### 5. Erişilebilirlik (Accessibility)
- **Color Contrast:** Cam efektli arka planların okunabilirliği bozmaması için body::before ile arka plan fotoğraflarının hafifçe karartılması (rgba(0,0,0,0.45))
- **User Feedback:** Tarayıcının standart alert() pencereleri yerine, ekrana şık bir şekilde gelen Custom Modal (Özel Uyarı Penceresi) sistemi
- **Interactive Feedback:** Butonların (hover) üzerine gelindiğinde büyümesi ve renk değiştirmesi.
### 6. Browser Compatibility
- **Modern Browsers:** Chrome, Firefox, Safari, Edge (son 2 versiyon)
- **Polyfills:** ES6+ JavaScript özellikleri (Arrow functions, Template Literals, Destructuring)
- **Asynchronous Operations:** Veri çekme işlemleri için tüm modern tarayıcıların desteklediği async/await ve Fetch API kullanımı.

### 7. State Management
- **Local State:** Kullanıcı giriş bilgileri ve ID'sinin tarayıcının localStorage ("aktif_kullanici_id") belleğinde tutulması
- **DOM Manipulation:** Gelen API verilerine göre JavaScript (document.getElementById) ile HTML'in dinamik olarak yeniden çizilmesi

### 8. Routing
- **Client-Side Routing:** Saf HTML yönlendirmeleri (window.location.href = "dashboard.html")
- **Protected Routes:** app.js içindeki checkAuth() fonksiyonu ile oturum açmamış kullanıcıların anında index.html'e geri postalanması (Route Guard mantığı)
- **Dynamic URLs:** Detay sayfasına gidilirken URL üzerinden ID taşınması (detay.html?id=12345) ve URLSearchParams ile bu ID'nin yakalanması

### 9. API Entegrasyonu
- **HTTP Client:** Fetch API
- **Centralized URL Management:** BASE_URL değişkeni ile lokal testlerden canlı (Vercel) sunucuya tek tuşla geçiş imkanı
- **Error Handling:** try...catch blokları içine alınarak sunucu çökse bile kullanıcıya "Sunucuya ulaşılamadı" şeklinde mantıklı hata mesajları gösterilmesi

### 10. Testing
- **Frontend Validation:** HTML5 required attribute'ları ile boş form gönderiminin engellenmesi
- **Debugging:** Chrome DevTools (F12) Console sekmesi üzerinden API yanıtlarının izlenmesi
- **Postman Integration:** Backend API rotalarının (GET, POST, PUT, DELETE) Postman üzerinden düzenli olarak test edilmesi

### 11. Build ve Deployment
- **Build Tool:** Proje Vanilla (Saf) olduğu için Webpack veya Vite gibi derleyicilere ihtiyaç duymaz, dosyalar anında çalışır
- **Database:** MongoDB Atlas
- **Environment Variables:** .env files
- **Hosting:** Vercel