// BURAYA KENDİ VERCEL LİNKİNİ YAZ (Sonunda / olmadan)
const BASE_URL = "https://route-master-ten.vercel.app";

// --- 1. KAYIT OL (REGISTER) İŞLEMİ ---
const registerForm = document.getElementById('registerForm');
if (registerForm) { // EĞER SAYFADA BU FORM VARSA ÇALIŞTIR!
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Butona basınca sayfanın yenilenmesini engeller

    // Formdaki verileri alıyoruz
        const firstName = document.getElementById('regFirstName').value;
        const lastName = document.getElementById('regLastName').value;
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            // Vercel'deki /auth/register rotasına istek atıyoruz
                const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, username, email, password })
            });

        const data = await response.json();

        if (response.ok) {
            alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
            document.getElementById('registerForm').reset(); // Formu temizle
        } else {
            alert("Kayıt Hatası: " + data.message);
        }
        } catch (error) {
            console.error("Sunucuya ulaşılamadı:", error);
            alert("Sunucu ile bağlantı kurulamadı.");
        }
    
});
}

// --- 2. GİRİŞ YAP (LOGIN) İŞLEMİ ---
const loginForm = document.getElementById('loginForm');
if (loginForm) { // EĞER SAYFADA BU FORM VARSA ÇALIŞTIR!
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

        if (response.ok) {
            // Backend'den gelen cevabı konsola yazdır (F12'den görmek için)
            console.log("Backend Yanıtı:", data);

            // Bütün ihtimalleri kapsayan ID yakalama taktiği!
            const userId = data.userId || data._id || (data.user ? data.user._id : null);

            if (userId) {
                alert("Giriş Başarılı! Ana sayfaya yönlendiriliyorsunuz...");
                localStorage.setItem("aktif_kullanici_id", userId);
                window.location.href = "dashboard.html"; 
            } else {
                alert("Giriş yapıldı ama Backend'den Kullanıcı ID'si gelmedi! F12 Console'a bak.");
            }
        } else {
            alert("Giriş Hatası: E-posta veya şifre yanlış.");
        }
        } catch (error) {
            console.error("Sunucuya ulaşılamadı:", error);
        }
    });
}

// --- 3. DASHBOARD (ANA SAYFA) İŞLEMLERİ ---

// Sayfa yüklendiğinde otomatik çalışacak kontroller
// --- DASHBOARD (ANA SAYFA) DOĞRUDAN BAŞLATICI ---

// Sayfada 'traveloguesContainer' var mı diye bak (Yani Ana Sayfada mıyız?)
const container = document.getElementById('traveloguesContainer');

if (container) {
    // Sayfadaysak beklemeden doğrudan çalıştır!
    checkAuth(); 
    fetchTravelogues(); 
}
// Güvenlik: Giriş yapmayanları index.html'e geri kovala!
// Güvenlik: Giriş yapmayanları index.html'e geri kovala!
function checkAuth() {
    const userId = localStorage.getItem("aktif_kullanici_id");
    
    // Eğer ID yoksa veya kelime olarak "undefined" kaydedildiyse
    if (!userId || userId === "undefined" || userId === "null") {
        localStorage.removeItem("aktif_kullanici_id"); // Bozuk veriyi temizle
        window.location.href = "index.html";
    }
}
// Çıkış Yapma Fonksiyonu
function logout() {
    localStorage.removeItem("aktif_kullanici_id");
    window.location.href = "index.html";
}

// Vercel'den Gezi Yazılarını Çeken Fonksiyon
// Güncellenmiş Vercel'den Yazı Çekme Fonksiyonu (Artık şehir de alabiliyor!)
async function fetchTravelogues(arananSehir = "") {
    try {
        // NOT: Eğer backend'de rotayı 'travelogue' (tekil) yaptıysan aşağıdaki 's' harfini sil.
        // Postman'de hangisi çalıştıysa onu kullan: /travelogues veya /travelogue
        let url = `${BASE_URL}/travelogue`;

        // Eğer bir şehir ismi gelmişse linke ekle
        if (arananSehir !== "") {
            url += `?city=${encodeURIComponent(arananSehir)}`;
        }

        const response = await fetch(url);
        
        // Eğer sunucu 404 veya 500 dönerse catch bloğuna gitmesi için kontrol
        if (!response.ok) throw new Error("Sunucu yanıt vermedi: " + response.status);

        const yazilar = await response.json();
        const container = document.getElementById('traveloguesContainer');
        container.innerHTML = ""; 

        if (yazilar.length === 0) {
            container.innerHTML = `<p style="text-align:center;">Şu an gösterilecek yazı bulunamadı. 🌍</p>`;
            return;
        }

        yazilar.forEach(yazi => {
            container.innerHTML += `
                <div class="card">
                    <h3>${yazi.title}</h3>
                    <span class="city-tag">${yazi.city}, ${yazi.country}</span>
                    <p>${yazi.content.substring(0, 150)}...</p>
                    <small>📍 Gezilecek Yerler: ${yazi.placesToVisit ? yazi.placesToVisit.join(', ') : '-'}</small>
                    <button class="action-btn" onclick="favoriyeEkle('${yazi._id}')">❤️ Favoriye Ekle</button>
                </div>
            `;
        });

    } catch (error) {
        console.error("Hata Detayı:", error);
        document.getElementById('traveloguesContainer').innerHTML = 
            `<p style="color:red; text-align:center;">Hata: Yazılar yüklenemedi. Sunucu bağlantısını kontrol edin.</p>`;
    }
}

// Yeni Arama Butonu Fonksiyonu
// Güncellenmiş Arama Butonu Fonksiyonu
function sehireGoreAra() {
    const sehirAdi = document.getElementById('searchInput').value.trim();
    
    // Eğer kutucuk boşsa (kullanıcı silip arama tuşuna bastıysa), TÜM yazıları getir!
    if (sehirAdi === "") {
        fetchTravelogues(); 
    } else {
        // Kutu doluysa, sadece o şehri getir
        fetchTravelogues(sehirAdi);
    }
}

// Geçiçi Favori Fonksiyonu (Sonra içini dolduracağız)
function favoriyeEkle(yaziId) {
    alert("Favoriye ekleme özelliği yakında gelecek! Seçilen Yazı ID: " + yaziId);
}

// --- 4. YENİ GEZİ YAZISI EKLEME İŞLEMİ ---
const addTravelogueForm = document.getElementById('addTravelogueForm');

if (addTravelogueForm) {
    checkAuth();

    addTravelogueForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Formdaki değerleri alıyoruz
        const title = document.getElementById('tTitle').value;
        const authorName = document.getElementById('tAuthorName').value; // YENİ EKLENDİ!
        const city = document.getElementById('tCity').value;
        const country = document.getElementById('tCountry').value;
        const content = document.getElementById('tContent').value;
        
        const placesToVisit = document.getElementById('tPlaces').value.split(',').map(place => place.trim());
        const userId = localStorage.getItem("aktif_kullanici_id");

        // Backend'e gönderilecek JSON verisi (Eksik parçayı tamamladık!)
        const newTravelogue = {
            title: title,
            authorName: authorName, // YENİ EKLENDİ!
            city: city,
            country: country,
            content: content,
            placesToVisit: placesToVisit,
            userId: userId
        };

        try {
            const response = await fetch(`${BASE_URL}/travelogue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTravelogue)
            });

            if (response.ok) {
                alert("Gezi yazınız başarıyla eklendi! 🎉");
                window.location.href = "dashboard.html"; 
            } else {
                const data = await response.json();
                alert("Ekleme başarısız oldu: " + (data.message || data.error || "Bilinmeyen hata"));
            }
        } catch (error) {
            console.error("Yazı eklenirken hata oluştu:", error);
            alert("Sunucuya bağlanırken bir hata oluştu.");
        }
    });
}