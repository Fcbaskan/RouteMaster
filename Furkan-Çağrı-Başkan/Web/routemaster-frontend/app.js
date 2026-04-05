// BURAYA KENDİ VERCEL LİNKİNİ YAZ (Sonunda / olmadan)
const BASE_URL = "https://route-master-ten.vercel.app";

// --- 1. KAYIT OL (REGISTER) İŞLEMİ ---
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini durdur

        try {
            // HTML'deki yeni ID'lerle verileri çekiyoruz
            const firstName = document.getElementById('regFirstName').value;
            const lastName = document.getElementById('regLastName').value;
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            // Vercel'e veriyi yolluyoruz
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, firstName, lastName })
            });

            if (response.ok) {
                registerForm.reset(); 
                // Eski alert yerine yeni fonksiyonumuz:
                if (typeof showModal === "function") {
                    showModal("Aramıza Hoş Geldiniz! 🎉\nŞimdi giriş yapabilirsiniz.", true, () => {
                        ekranDegistir('loginCard'); // "Tamam"a basınca giriş ekranına kaydır
                    });
                }
            }
            else {
                const data = await response.json();
                if (typeof showModal === "function") {
                    showModal("Kayıt Hatası: \n" + (data.message || "Bilgileri kontrol edin."), false, null);
                }
            }
        } catch (error) {
            console.error("Kayıt işlemi sırasında hata:", error);
            alert("Sistemsel bir hata oluştu, lütfen F12 Console ekranına bakın.");
        }
    });
}

// --- 2. GİRİŞ YAP (LOGIN) İŞLEMİ ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. DÜZELTME: HTML'de güncellediğimiz yeni ID'leri buraya yazdık
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // 2. DÜZELTME: response.json()'u SADECE BİR KERE burada okuyoruz!
            const data = await response.json();

            if (response.ok) {
                // 3. DÜZELTME: Senin backend'ine göre ID yolu data.user._id şeklindedir!
                localStorage.setItem("aktif_kullanici_id", data.user._id);

                if (typeof showModal === "function") {
                    showModal("Giriş Başarılı! 🌍\nRouteMaster'a yönlendiriliyorsunuz...", true, () => {
                        window.location.href = "dashboard.html"; 
                    });
                }
            } else {
                if (typeof showModal === "function") {
                    showModal("Hata: \n" + (data.message || "Giriş yapılamadı."), false, null);
                }
            }
        } catch (error) {
            console.error("Sunucuya ulaşılamadı:", error);
            if (typeof showModal === "function") {
                showModal("Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edin.", false, null);
            }
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
            const fotoUrl = `https://picsum.photos/seed/${yazi._id}/800/400`;

            // KRİTİK DÜZELTME: Veritabanından gelen puanı alıyoruz (Yoksa 0 sayıyoruz)
            // Backend'den gelen değişken isminin 'averageRating' olduğunu varsayıyoruz
            const puan = Math.round(yazi.averageRating || 0); 
            
            let yildizHtml = "";
            for (let i = 1; i <= 5; i++) {
                // Eğer döngüdeki sayı puandan küçükse dolu, büyükse boş yıldız bas
                if (i <= puan) {
                    yildizHtml += `<span style="color:#ffc107; font-size:20px;">★</span>`;
                } else {
                    yildizHtml += `<span style="color:#ccc; font-size:20px;">☆</span>`;
                }
            }

            container.innerHTML += `
                <div class="card glass-panel">
                    <div class="card-image-wrapper">
                        <img src="${fotoUrl}" alt="${yazi.city} manzarası">
                        <span class="city-tag">${yazi.city}, ${yazi.country}</span>
                    </div>
                    <div class="card-body">
                        <h3>${yazi.title}</h3>
                        <div class="author-line">👤 ${yazi.authorName || "Gizemli Gezgin"}</div>
                        <p>${yazi.content.substring(0, 130)}...</p>
                        <small>📍 ${yazi.placesToVisit && yazi.placesToVisit.length > 0 ? yazi.placesToVisit.join(', ') : '-'}</small>
                        <button onclick="window.location.href='detay.html?id=${yazi._id}'" style="width:100%; margin-top:15px; padding:10px; background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.3); border-radius:8px; cursor:pointer; font-weight:600;">Tamamını Oku 📖</button>
                    </div>
                    <div class="card-footer">
                        <div class="star-rating">
                            <small style="margin-right: 5px;">Puan: </small>
                            <div id="display-stars-${yazi._id}">${yildizHtml}</div>
                        </div>
                        <button class="action-btn" onclick="favoriyeEkle('${yazi._id}', this)">❤️ Favori</button>
                    </div>
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
            authorId: userId
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

// --- 5. FAVORİLERE EKLEME İŞLEMİ ---
async function favoriyeEkle(yaziId, butonElementi) {
    const userId = localStorage.getItem("aktif_kullanici_id");
    if (!userId) return; // Giriş yapmadıysa sessizce dur

    const favoriVerisi = { userId: userId, itemId: yaziId, type: "travelogue" };

    // Kullanıcıya anında tepki ver (Yükleniyor...)
    butonElementi.innerHTML = "⏳ Ekleniyor...";
    butonElementi.disabled = true;

    try {
        const response = await fetch(`${BASE_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favoriVerisi)
        });

        if (response.ok) {
            // Başarılı olursa butonu yeşil yap ve yazısını değiştir
            butonElementi.innerHTML = "✅ Favorilere Eklendi";
            butonElementi.style.backgroundColor = "#28a745"; // Yeşil
            butonElementi.style.color = "white";
        } else {
            // Eğer zaten ekliyse sarı yapıp bilgi ver
            butonElementi.innerHTML = "⭐ Zaten Favorilerde";
            butonElementi.style.backgroundColor = "#ffc107"; // Sarı
            butonElementi.style.color = "black";
        }
    } catch (error) {
        console.error("Favoriye eklerken hata:", error);
        butonElementi.innerHTML = "❤️ Favoriye Ekle"; // Hata olursa eski haline döndür
        butonElementi.disabled = false;
    }
}

// --- 6. FAVORİLERİ GETİRME VE SİLME İŞLEMLERİ ---

// Sayfa favoriler.html ise otomatik çalışsın
const favContainer = document.getElementById('favoritesContainer');
if (favContainer) {
    checkAuth();
    fetchFavorites();
}

// Favorileri Backend'den Çekme
async function fetchFavorites() {
    const userId = localStorage.getItem("aktif_kullanici_id");
    
    try {
        // DİKKAT: Backend'de favorileri getirme URL'ni buraya doğru yazmalısın.
        // Genelde /favorites/:userId veya /users/:userId/favorites şeklinde olur.
        const response = await fetch(`${BASE_URL}/favorites/${userId}`);
        const favoriler = await response.json();

        favContainer.innerHTML = ""; // Yükleniyor yazısını sil

        if (favoriler.length === 0) {
            favContainer.innerHTML = "<p>Henüz favorilere eklediğiniz bir gezi yazısı yok.</p>";
            return;
        }

        // Favorileri ekrana bas (Backend'den dönen yapıya göre yazi.itemId.title da olabilir, direkt yazi.title da)
        favoriler.forEach(fav => {
            // Eğer backend gezi yazısı detaylarını (populate) getirmiyorsa, sadece ID'ler döner.
            // Biz şimdilik verilerin tam geldiğini varsayarak yazdırıyoruz:
            favContainer.innerHTML += `
                <div class="card">
                    <h3>Favori Gezi Yazısı ID: ${fav.itemId || fav._id}</h3>
                    <p>Bu yazı favorilerinizde duruyor.</p>
                    <button class="remove-btn" onclick="favoridenCikar('${fav.itemId || fav._id}')">❌ Favorilerden Çıkar</button>
                </div>
            `;
        });

    } catch (error) {
        console.error("Favoriler çekilemedi:", error);
        favContainer.innerHTML = "<p style='color:red;'>Favoriler yüklenirken bir hata oluştu.</p>";
    }
}

// Favorilerden Çıkarma (DELETE) - Hatırlarsan bunu sadece URL'den yollayarak çözmüştük!
async function favoridenCikar(itemId) {
    const userId = localStorage.getItem("aktif_kullanici_id");

    const onay = confirm("Bu yazıyı favorilerden çıkarmak istediğinize emin misiniz?");
    if (!onay) return;

    try {
        // Tam olarak Postman'de düzelttiğimiz o harika DELETE URL yapısı:
        const response = await fetch(`${BASE_URL}/favorites/${itemId}/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Yazı favorilerden başarıyla çıkarıldı!");
            fetchFavorites(); // Listeyi otomatik olarak yenile (silinen ekrandan gitsin)
        } else {
            const data = await response.json();
            alert("Hata: " + (data.message || "Silinemedi"));
        }
    } catch (error) {
        console.error("Favori silinemedi:", error);
        alert("Sunucu bağlantı hatası.");
    }
}

// --- 7. BENİM YAZILARIM (FİLTRELEME VE SİLME) ---

const myContainer = document.getElementById('myTraveloguesContainer');
if (myContainer) {
    checkAuth();
    fetchMyTravelogues();
}

async function fetchMyTravelogues() {
    const userId = localStorage.getItem("aktif_kullanici_id");
    
    try {
        // Tüm yazıları çekiyoruz
        const response = await fetch(`${BASE_URL}/travelogue`); // Sendeki link tekil miydi çoğul muydu, ona dikkat et (/travelogues de olabilir)
        const tumYazilar = await response.json();

        myContainer.innerHTML = ""; 

        // SADECE yazar ID'si benim ID'm ile eşleşenleri filtrele!
        // (Backend'de yazar bilgisini 'author' adıyla kaydetmiştik hatırlarsan)
        const benimYazilarim = tumYazilar.filter(yazi => yazi.author === userId || yazi.userId === userId);

        if (benimYazilarim.length === 0) {
            myContainer.innerHTML = "<p>Henüz kendi eklediğiniz bir gezi yazısı bulunmuyor. Hemen bir tane ekleyin!</p>";
            return;
        }

benimYazilarim.forEach(yazi => {
            myContainer.innerHTML += `
                <div class="card">
                    <h3>${yazi.title}</h3>
                    <span style="background: #17a2b8; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">${yazi.city}, ${yazi.country}</span>
                    <p>${yazi.content.substring(0, 100)}...</p>
                    
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="duzenleyeGit('${yazi._id}')" style="background-color: #ffc107; color: black; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; flex: 1; font-weight: bold;">✏️ Düzenle</button>
                        <button class="delete-btn" onclick="yaziSil('${yazi._id}')" style="flex: 1;">🗑️ Sil</button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Yazılar çekilemedi:", error);
        myContainer.innerHTML = "<p style='color:red;'>Yazılar yüklenirken bir hata oluştu.</p>";
    }
}

// Gezi Yazısını Veritabanından Silme (DELETE)
async function yaziSil(yaziId) {
    const onay = confirm("Bu gezi yazısını KESİNLİKLE silmek istiyor musunuz? Bu işlem geri alınamaz!");
    if (!onay) return;

    try {
        // Vercel'deki silme rotasına istek atıyoruz
        const response = await fetch(`${BASE_URL}/travelogue/${yaziId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Yazınız veritabanından başarıyla silindi! 🚀");
            fetchMyTravelogues(); // Silinen yazının ekrandan anında kaybolması için listeyi yenile
        } else {
            const data = await response.json();
            alert("Silinemedi: " + (data.message || "Bilinmeyen hata"));
        }
    } catch (error) {
        console.error("Silme işlemi başarısız:", error);
        alert("Sunucuya ulaşılamadı.");
    }
}

// Düzenle Butonuna Basılınca ID'yi alıp yeni sayfaya götürür
function duzenleyeGit(yaziId) {
    window.location.href = `duzenle.html?id=${yaziId}`;
}

// --- 8. YAZI DÜZENLEME (UPDATE) İŞLEMLERİ ---

const editForm = document.getElementById('editTravelogueForm');

if (editForm) {
    checkAuth();
    
    // Linkteki ?id=... kısmından yazi ID'sini yakalıyoruz
    const urlParams = new URLSearchParams(window.location.search);
    const yaziId = urlParams.get('id');

    if (yaziId) {
        // Sayfa açılır açılmaz eski verileri kutulara doldur!
        eskiVerileriDoldur(yaziId);
    } else {
        alert("Düzenlenecek yazı bulunamadı!");
        window.location.href = "benimyazilarim.html";
    }

    // "Değişiklikleri Kaydet" Butonuna Basıldığında (PUT İsteği)
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Kutulardaki yeni (değiştirilmiş) verileri topla
        const updatedData = {
            title: document.getElementById('eTitle').value,
            authorName: document.getElementById('eAuthorName').value,
            city: document.getElementById('eCity').value,
            country: document.getElementById('eCountry').value,
            content: document.getElementById('eContent').value,
            placesToVisit: document.getElementById('ePlaces').value.split(',').map(p => p.trim()),
            author: localStorage.getItem("aktif_kullanici_id")
        };

        try {
            // Vercel'e PUT (Güncelle) isteği atıyoruz
            const response = await fetch(`${BASE_URL}/travelogue/${yaziId}`, {
                method: 'PUT', // DİKKAT: Backend'de güncelleme metodun PUT mu PATCH mi ayarladığına göre değişir. Genelde PUT'tur.
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("Yazınız başarıyla güncellendi! 🛠️");
                window.location.href = "benimyazilarim.html"; 
            } else {
                const data = await response.json();
                alert("Güncellenemedi: " + (data.message || "Hata"));
            }
        } catch (error) {
            console.error("Güncelleme hatası:", error);
            alert("Sunucuya ulaşılamadı.");
        }
    });
}

// Eski verileri çekip kutulara yapıştıran fonksiyon
async function eskiVerileriDoldur(id) {
    try {
        const response = await fetch(`${BASE_URL}/travelogue/${id}`);
        if (!response.ok) throw new Error("Yazı bulunamadı");
        
        const yazi = await response.json();

        // Kutuların içini veritabanından gelen verilerle doldur
        document.getElementById('eTitle').value = yazi.title;
        document.getElementById('eAuthorName').value = yazi.authorName || "";
        document.getElementById('eCity').value = yazi.city;
        document.getElementById('eCountry').value = yazi.country;
        document.getElementById('ePlaces').value = yazi.placesToVisit ? yazi.placesToVisit.join(', ') : "";
        document.getElementById('eContent').value = yazi.content;

    } catch (error) {
        console.error("Veriler getirilemedi:", error);
        alert("Eski veriler yüklenirken bir hata oluştu.");
    }
}

// --- 9. PUANLAMA (RATING) İŞLEMLERİ ---

async function puanVer(yaziId, verilenPuan) {
    const userId = localStorage.getItem("aktif_kullanici_id");
    if (!userId) return;

    // Görseli anında güncelle (Sayfa yenilenmeden önceki hali için)
    const container = document.getElementById(`star-container-${yaziId}`);
    if (container) {
        const yildizlar = container.getElementsByTagName('span');
        // İlk eleman "Puanla:" metni olduğu için 1. indisten başlıyoruz
        for (let i = 1; i <= 5; i++) {
            if (i <= verilenPuan) {
                yildizlar[i].innerText = "★";
                yildizlar[i].style.color = "#ffc107";
            } else {
                yildizlar[i].innerText = "☆";
                yildizlar[i].style.color = "#ccc";
            }
        }
    }

    // Backend'e kaydet
    await fetch(`${BASE_URL}/ratings/${yaziId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, rating: verilenPuan })
    });
}

async function puanSil(yaziId) {
    const userId = localStorage.getItem("aktif_kullanici_id");
    if (!userId) return;

    try {
        const response = await fetch(`${BASE_URL}/ratings/${yaziId}/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Silme başarılıysa alert verme, sadece yıldızları tekrar gri yap (sıfırla)
            const container = document.getElementById(`star-container-${yaziId}`);
            if (container) {
                const yildizlar = container.getElementsByTagName('span');
                for (let i = 0; i < 5; i++) {
                    yildizlar[i].innerText = "☆";
                    yildizlar[i].style.color = "#ccc";
                }
            }
        }
    } catch (error) {
        console.error("Puan silme hatası:", error);
    }
}

// --- 10. PROFİL YÖNETİMİ İŞLEMLERİ ---

const profileUpdateForm = document.getElementById('profileUpdateForm');
const passwordUpdateForm = document.getElementById('passwordUpdateForm');

if (profileUpdateForm && passwordUpdateForm) {
    checkAuth();
    profilGetir(); // Sayfa açılınca mevcut bilgileri kutulara doldur

    // 1. PROFİL BİLGİLERİNİ GETİRME (GET)
    async function profilGetir() {
        const userId = localStorage.getItem("aktif_kullanici_id");
        try {
            const response = await fetch(`${BASE_URL}/auth/users/${userId}`); 
            
            if (response.ok) {
            const user = await response.json();
            
            // Backend'den artık firstName ve lastName geliyor
            document.getElementById('pName').value = user.firstName || "";
            document.getElementById('pSurname').value = user.lastName || "";
            document.getElementById('pUsername').value = user.username || "";
            document.getElementById('pEmail').value = user.email || "";
        }
        } catch (error) {
            console.error("Profil getirilemedi:", error);
        }
    }

    // 2. PROFİL GÜNCELLEME (PUT)
    profileUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("aktif_kullanici_id");

        // Backend'inin tam olarak beklediği paket: { email, displayName }
// Backend'inin tam olarak beklediği paket: { email, firstName, lastName }
        const updatedData = {
            firstName: document.getElementById('pName').value,
            lastName: document.getElementById('pSurname').value,
            username: document.getElementById('pUsername').value,
            email: document.getElementById('pEmail').value 
        };

        try {
            const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert("Profil bilgileriniz başarıyla güncellendi! ✅");
            } else {
                const data = await response.json();
                alert("Güncelleme başarısız: " + (data.message || "Bilinmeyen hata"));
            }
        } catch (error) {
            console.error("Profil güncellenirken hata:", error);
        }
    });

    // 3. ŞİFRE GÜNCELLEME (PUT)
    passwordUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("aktif_kullanici_id");
        
        // Backend'inin tam olarak beklediği değişken isimleri: currentPassword, newPassword
        const currentPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;

        try {
            const response = await fetch(`${BASE_URL}/auth/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert(data.message); // Backend'den gelen "Şifre başarıyla güncellendi!" mesajı
                document.getElementById('oldPassword').value = "";
                document.getElementById('newPassword').value = "";
            } else {
                alert("Hata: " + (data.message || "Şifre değiştirilemedi."));
            }
        } catch (error) {
            console.error("Şifre hatası:", error);
        }
    });
}

// 4. HESAP SİLME (DELETE)
async function hesapSil() {
    const userId = localStorage.getItem("aktif_kullanici_id");
    if (!userId) return;

    const onay = confirm("DİKKAT! Hesabınızı silerseniz tüm verileriniz kalıcı olarak yok olur. Emin misiniz?");
    if (!onay) return;

    const sonOnay = confirm("Bu işlem geri alınamaz. Gerçekten silmek istiyor musunuz?");
    if (!sonOnay) return;

    try {
        const response = await fetch(`${BASE_URL}/auth/users/${userId}`, { 
            method: 'DELETE' 
        });

        // Backend 204 (No Content) döndüğü için response.json() yapmıyoruz, direkt siliyoruz!
        if (response.ok) {
            alert("Hesabınız başarıyla silindi. Elveda! 👋");
            localStorage.removeItem("aktif_kullanici_id"); 
            window.location.href = "index.html"; 
        } else {
            alert("Hesap silinemedi.");
        }
    } catch (error) {
        console.error("Hesap silinirken hata:", error);
        alert("Sunucuya ulaşılamadı.");
    }
}

// --- 11. DETAY SAYFASI (TEKİL GEZİ YAZISI) İŞLEMLERİ ---
const detayContainer = document.getElementById('geziDetayContainer');

if (detayContainer) {
    checkAuth();
    
    // Tarayıcıdaki linkten id'yi yakala (Örn: detay.html?id=12345)
    const urlParams = new URLSearchParams(window.location.search);
    const yaziId = urlParams.get('id');

    if (yaziId) {
        geziDetaylariniGetir(yaziId);
    } else {
        detayContainer.innerHTML = "<h2 style='text-align:center;'>Gezi yazısı bulunamadı! ❌</h2>";
    }
}

async function geziDetaylariniGetir(id) {
    try {
        const response = await fetch(`${BASE_URL}/travelogue/${id}`);
        const yazi = await response.json();
        
        // Veritabanındaki güncel puanı çekiyoruz
        const aktifPuan = Math.round(yazi.averageRating || 0);

        detayContainer.innerHTML = `
            <div class="detail-header">
                <h1>${yazi.title}</h1>
                <div class="meta"><span>📍 ${yazi.city}</span> | <span>👤 ${yazi.authorName || "Gezgin"}</span></div>
            </div>
            <div class="detail-image"><img src="https://picsum.photos/seed/${yazi._id}/1000/500"></div>
            <div class="detail-content"><p>${yazi.content}</p></div>
            <div class="interaction-bar">
                <div class="star-rating">
                    <span style="font-size: 16px;">Puanla: </span>
                    <span id="star-container-${yazi._id}">
                        ${[1, 2, 3, 4, 5].map(n => `
                            <span style="color:${n <= aktifPuan ? '#ffc107' : '#ccc'}; cursor:pointer;" onclick="puanVer('${yazi._id}', ${n})">
                                ${n <= aktifPuan ? '★' : '☆'}
                            </span>
                        `).join('')}
                    </span>
                    <button onclick="puanSil('${yazi._id}')" class="delete-rating-btn">Sıfırla 🗑️</button>
                </div>
                <button class="action-btn" onclick="favoriyeEkle('${yazi._id}', this)">❤️ Favorilere Ekle</button>
            </div>
        `;
    } catch (error) {
        console.error("Detay hatası:", error);
    }
}