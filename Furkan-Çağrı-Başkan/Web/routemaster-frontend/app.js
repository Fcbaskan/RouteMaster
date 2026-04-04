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
    const container = document.getElementById('traveloguesContainer');
    
    // Eğer dashboard sayfasındaysak
    if (container) {
        checkAuth(); // 1. Önce kullanıcı giriş yapmış mı bak
        
        // 2. Sayfa ilk açıldığında HİÇBİR parametre göndermeden fonksiyonu çağır.
        // Bu sayede fonksiyon "arananSehir"i boş algılayacak ve TÜM yazıları getirecek.
        fetchTravelogues(); 
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