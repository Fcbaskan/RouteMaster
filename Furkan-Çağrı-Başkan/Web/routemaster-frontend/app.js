// BURAYA KENDİ VERCEL LİNKİNİ YAZ (Sonunda / olmadan)
const BASE_URL = "https://route-master-ten.vercel.app";

// --- 1. KAYIT OL (REGISTER) İŞLEMİ ---
document.getElementById('registerForm').addEventListener('submit', async (e) => {
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

// --- 2. GİRİŞ YAP (LOGIN) İŞLEMİ ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
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
            alert("Giriş Başarılı! Ana sayfaya yönlendiriliyorsunuz...");
            
            // DİKKAT: Postman'de otomatik aldığımız o kullanıcı ID'sini şimdi tarayıcıya kaydediyoruz!
            // (Backend'in ID'yi nerede döndüğüne göre burası data.user._id veya data._id olabilir)
            const userId = data.user ? data.user._id : data._id; 
            localStorage.setItem("aktif_kullanici_id", userId);
            
            // Eğer token döndürüyorsan onu da kaydedebilirsin:
            // localStorage.setItem("token", data.token);

            // Giriş başarılıysa gezi yazılarının olduğu sayfaya yönlendir
            window.location.href = "dashboard.html"; 
        } else {
            alert("Giriş Hatası: E-posta veya şifre yanlış.");
        }
    } catch (error) {
        console.error("Sunucuya ulaşılamadı:", error);
    }
});

// --- 3. DASHBOARD (ANA SAYFA) İŞLEMLERİ ---

// Sayfa yüklendiğinde otomatik çalışacak kontroller
document.addEventListener('DOMContentLoaded', () => {
    // Sadece dashboard.html sayfasındaysak bu kodları çalıştır
    const container = document.getElementById('traveloguesContainer');
    if (container) {
        checkAuth(); // Kullanıcı giriş yapmış mı kontrol et
        fetchTravelogues(); // Gezi yazılarını getir
    }
});

// Güvenlik: Giriş yapmayanları index.html'e geri kovala!
function checkAuth() {
    const userId = localStorage.getItem("aktif_kullanici_id");
    if (!userId) {
        alert("Lütfen önce giriş yapın!");
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
        // Eğer fonksiyona bir şehir adı gönderildiyse linkin sonuna ?city=... ekle
        // Gönderilmediyse (tüm yazılar isteniyorsa) sade linki kullan
        const url = arananSehir 
            ? `${BASE_URL}/travelogues?city=${arananSehir}` 
            : `${BASE_URL}/travelogues`;

        const response = await fetch(url);
        const yazilar = await response.json();

        const container = document.getElementById('traveloguesContainer');
        container.innerHTML = ""; // Önceki yazıları temizle

        if (yazilar.length === 0) {
            container.innerHTML = `<p>Burası şimdilik boş. Belki de bu şehre ilk sen gitmelisin!</p>`;
            return;
        }

        // Gelen yazıları HTML'e bas
        yazilar.forEach(yazi => {
            const card = `
                <div class="card">
                    <h3>${yazi.title}</h3>
                    <span class="city-tag">${yazi.city}, ${yazi.country}</span>
                    <p>${yazi.content.substring(0, 100)}...</p>
                    <small>Gezilecek Yerler: ${yazi.placesToVisit.join(', ')}</small>
                    <br>
                    <button class="action-btn" onclick="favoriyeEkle('${yazi._id}')">❤️ Favoriye Ekle</button>
                </div>
            `;
            container.innerHTML += card;
        });

    } catch (error) {
        console.error("Yazılar çekilemedi:", error);
        document.getElementById('traveloguesContainer').innerHTML = "<p>Yazılar yüklenirken bir hata oluştu.</p>";
    }
}

// Yeni Arama Butonu Fonksiyonu
function sehireGoreAra() {
    const sehirAdi = document.getElementById('searchInput').value.trim();
    
    if (sehirAdi === "") {
        alert("Lütfen aramak istediğiniz şehri kutucuğa yazın!");
        return;
    }

    // Seçilen şehri az önce güncellediğimiz ana fonksiyona yolla
    fetchTravelogues(sehirAdi);
}

// Geçiçi Favori Fonksiyonu (Sonra içini dolduracağız)
function favoriyeEkle(yaziId) {
    alert("Favoriye ekleme özelliği yakında gelecek! Seçilen Yazı ID: " + yaziId);
}