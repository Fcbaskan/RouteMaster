const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { User, Travelogue, CityRating, Favorite } = require('./models');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/routemaster')
  .then(() => console.log('✅ MongoDB veritabanına başarıyla bağlanıldı!'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));


app.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Kullanıcı adı, e-posta ve şifre zorunludur!" });
        }

        const existingUser = await User.findOne({ 
            $or: [{ email: email }, { username: username }] 
        });
        
        if (existingUser) {
            return res.status(409).json({ message: "Bu e-posta adresi veya kullanıcı adı zaten kayıtlı!" });
        }

        const newUser = new User({
            username,
            email,
            password,
            displayName: displayName || username
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);

    } catch (error) {
        console.error("Kayıt hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu.", error: error.message });
    }
});

app.put('/users/:userid', async (req, res) => {
    try {
        // URL'den kullanıcının ID'sini alıyoruz (Örn: /users/65f1a2b...)
        const userId = req.params.userid; 
        
        // Postman'den (Body'den) güncellenecek alanları alıyoruz
        const { displayName, bio, avatarUrl } = req.body;

        // MongoDB'de bu ID'ye sahip kullanıcıyı bul ve yeni bilgilerle güncelle
        // { new: true } ayarı, bize verinin güncellenmiş son halini geri döndürür
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { displayName, bio, avatarUrl }, 
            { new: true, runValidators: true }
        );

        // Eğer öyle bir kullanıcı veritabanında yoksa 404 dön
        if (!updatedUser) {
            return res.status(404).json({ message: "Profil bulunamadı" });
        }

        // Güvenlik: Güncel bilgileri geri döndürürken şifreyi gizle
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        // Başarıyla güncellendiğini belirt
        res.status(200).json(userResponse);

    } catch (error) {
        console.error("Profil güncelleme hatası:", error);
        // ID formatı hatalıysa da genellikle bu bloğa düşer
        res.status(400).json({ message: "Geçersiz istek veya sunucu hatası.", error: error.message });
    }
});

// --- 9. Profil Getirme (GET) ---
app.get('/users/:userid', async (req, res) => {
    try {
        // ID'ye göre kullanıcıyı bul, ancak şifreyi (password) getirme
        const user = await User.findById(req.params.userid).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "Profil bulunamadı" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

// --- 3. Hesap Silme (DELETE) ---
app.delete('/auth/users/:userid', async (req, res) => {
    try {
        // ID'ye göre bul ve sil
        const deletedUser = await User.findByIdAndDelete(req.params.userid);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }
        // Başarıyla silindiğinde 204 No Content dönülür (Gövdesi boştur)
        res.status(204).send(); 
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

// --- 4. Yeni Gezi Yazısı Ekleme (POST) ---
app.post('/travelogue', async (req, res) => {
    try {
        const { title, content, city, country, placesToVisit, authorId, authorName } = req.body;

        // Zorunlu alanları kontrol edelim
        if (!title || !content || !city || !country || !authorId) {
            return res.status(400).json({ message: "Başlık, içerik, şehir, ülke ve yazar bilgisi zorunludur!" });
        }

        

        // Mongoose şemasına uygun olarak yeni gezi yazısını oluştur
        const newTravelogue = new Travelogue({
            title,
            content,
            city,
            country,
            placesToVisit, // ["Ayasofya", "Kapalıçarşı"] gibi bir dizi gelecek
            author: authorId, // MongoDB'deki User ID'si
            authorName
        });

        // Veritabanına kaydet
        await newTravelogue.save();
        res.status(201).json(newTravelogue);

    } catch (error) {
        console.error("Gezi yazısı ekleme hatası:", error);
        res.status(500).json({ message: "Gezi yazısı eklenirken bir hata oluştu.", error: error.message });
    }
});

// --- 5. Gezi Yazısı Detayını Görüntüleme (GET) ---
app.get('/travelogue/:travelogueId', async (req, res) => {
    try {
        // URL'den gelen ID ile gezi yazısını bul
        const travelogue = await Travelogue.findById(req.params.travelogueId);
        
        if (!travelogue) {
            return res.status(404).json({ message: "Gezi yazısı bulunamadı" });
        }
        res.status(200).json(travelogue);
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

// --- 6. Gezi Yazısı Düzenleme (PUT) ---
app.put('/travelogue/:travelogueId', async (req, res) => {
    try {
        const { title, content, city, country, placesToVisit } = req.body;
        
        // Yeni verilerle güncelle ve updatedAt tarihini şu anki zaman yap
        const updatedTravelogue = await Travelogue.findByIdAndUpdate(
            req.params.travelogueId,
            { title, content, city, country, placesToVisit, updatedAt: Date.now() },
            { new: true, runValidators: true } // new: true ile güncellenmiş halini döndürürüz
        );

        if (!updatedTravelogue) {
            return res.status(404).json({ message: "Gezi yazısı bulunamadı" });
        }
        res.status(200).json(updatedTravelogue);
    } catch (error) {
        res.status(400).json({ message: "Geçersiz istek veya sunucu hatası.", error: error.message });
    }
});

// --- 7. Gezi Yazısı Silme (DELETE) ---
app.delete('/travelogue/:travelogueId', async (req, res) => {
    try {
        const deletedTravelogue = await Travelogue.findByIdAndDelete(req.params.travelogueId);
        
        if (!deletedTravelogue) {
            return res.status(404).json({ message: "Gezi yazısı bulunamadı" });
        }
        res.status(204).send(); // Başarılı silme işlemi genelde boş içerik (204) döner
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

// --- 8. Şehir Bazlı Yazıları Listeleme (GET) ---
// Dikkat: Daha önce konuştuğumuz gibi bu endpoint query parametresi (?city=Antalya) alır
app.get('/travelogue', async (req, res) => {
    try {
        // URL'den query parametrelerini al (page ve limit için varsayılan değerler atadık)
        const { city, country, limit = 10, page = 1 } = req.query;
        
        // Dinamik filtreleme objesi oluşturuyoruz
        let filter = {};
        if (city) filter.city = new RegExp(city, 'i'); // 'i' harfi büyük/küçük harf duyarlılığını kaldırır
        if (country) filter.country = new RegExp(country, 'i');

        // Sayfalama (Pagination) için kaç veri atlanacağını hesapla
        const skip = (page - 1) * limit;

        // Veritabanında ara, sayfalamayı uygula ve en yenileri en üstte getir
        const travelogues = await Travelogue.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }); 

        res.status(200).json(travelogues);
    } catch (error) {
        res.status(500).json({ message: "Yazılar getirilirken bir hata oluştu.", error: error.message });
    }
});

// --- 10. Şehir Puanlama (POST) ---
app.post('/ratings/:cityid', async (req, res) => {
    try {
        const cityId = req.params.cityid; // URL'den şehir adını/ID'sini alıyoruz (Örn: istanbul)
        
        // Normalde bu userId bilgisi JWT (Token) içinden otomatik alınır.
        // Ancak güvenlik katmanını henüz eklemediğimiz için şimdilik body'den alıyoruz.
        const { userId, rating } = req.body; 

        if (!userId || !rating) {
            return res.status(400).json({ message: "Kullanıcı ID ve puan (rating) zorunludur." });
        }

        const newRating = new CityRating({
            cityId,
            userId,
            rating
        });

        await newRating.save();
        res.status(201).json(newRating);
    } catch (error) {
        res.status(500).json({ message: "Puanlama yapılırken hata oluştu.", error: error.message });
    }
});

// --- 13. Favorilere Ekle (POST) ---
app.post('/users/:userid/favorites', async (req, res) => {
    try {
        const userId = req.params.userid;
        // type: "city" veya "travelogue" olabilir. itemId ise şehrin adı veya yazının ID'si.
        const { type, itemId } = req.body; 

        if (!type || !itemId) {
            return res.status(400).json({ message: "Tip (type) ve Öğe (itemId) zorunludur." });
        }

        // Aynı şeyi iki kere favorilere eklemesin diye kontrol ediyoruz
        const existingFavorite = await Favorite.findOne({ userId, type, itemId });
        if (existingFavorite) {
            return res.status(409).json({ message: "Bu öğe zaten favorilerinizde ekli!" });
        }

        const newFavorite = new Favorite({ userId, type, itemId });
        await newFavorite.save();

        res.status(201).json(newFavorite);
    } catch (error) {
        res.status(500).json({ message: "Favorilere eklenirken hata oluştu.", error: error.message });
    }
});

// --- 11. Favorileri Getirme (GET) (GÜNCELLENDİ) ---
app.get('/users/:userid/favorites', async (req, res) => {
    try {
        // Eğer URL'nin sonuna ?type=city yazılırsa sadece şehirleri, yazılmazsa hepsini getir
        const { type } = req.query;
        let filter = { userId: req.params.userid };
        
        if (type) {
            filter.type = type;
        }

        const favorites = await Favorite.find(filter).sort({ createdAt: -1 });
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ message: "Favoriler getirilirken hata oluştu.", error: error.message });
    }
});

// --- 12. Şifre Güncelleme (PUT) ---
app.put('/auth/users/:userid/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Önce kullanıcıyı veritabanında bul
        const user = await User.findById(req.params.userid);
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        // Gönderilen mevcut şifre, veritabanındakiyle eşleşiyor mu kontrol et
        if (user.password !== currentPassword) {
            return res.status(401).json({ message: "Mevcut şifreniz hatalı!" });
        }

        // Şifreyi güncelle ve kaydet
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Şifre başarıyla güncellendi!" });
    } catch (error) {
        res.status(500).json({ message: "Şifre güncellenirken hata oluştu.", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 RouteMaster API çalışıyor: http://localhost:${PORT}`);
});