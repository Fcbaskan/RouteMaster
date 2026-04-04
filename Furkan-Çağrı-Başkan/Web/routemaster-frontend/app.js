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