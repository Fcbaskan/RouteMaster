require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { User, Travelogue, CityRating, Favorite } = require('./models');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("RouteMaster API Başarıyla Çalışıyor! 🚀");
});

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }
    
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = db.connections[0].readyState === 1;
        console.log("MongoDB Atlas'a Başarıyla Bağlanıldı! 🚀");
    } catch (error) {
        console.error("Veritabanı bağlantı hatası:", error);
        throw error;
    }
};

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Sunucu veritabanına bağlanamadı." });
    }
});

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

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "E-posta ve şifre zorunludur!" });
        }

        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Geçersiz e-posta veya şifre!" });
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ 
            message: "Giriş başarılı!", 
            user: userResponse 
        });

    } catch (error) {
        console.error("Giriş hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu.", error: error.message });
    }
});

app.put('/users/:userid', async (req, res) => {
    try {
        const userId = req.params.userid; 
        
        const { displayName, bio, avatarUrl } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { displayName, bio, avatarUrl }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Profil bulunamadı" });
        }

        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);

    } catch (error) {
        console.error("Profil güncelleme hatası:", error);
        res.status(400).json({ message: "Geçersiz istek veya sunucu hatası.", error: error.message });
    }
});

app.get('/users/:userid', async (req, res) => {
    try {
        const user = await User.findById(req.params.userid).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "Profil bulunamadı" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

app.delete('/auth/users/:userid', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userid);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }
        res.status(204).send(); 
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

app.post('/travelogue', async (req, res) => {
    try {
        const { title, content, city, country, placesToVisit, authorId, authorName } = req.body;

        if (!title || !content || !city || !country || !authorId) {
            return res.status(400).json({ message: "Başlık, içerik, şehir, ülke ve yazar bilgisi zorunludur!" });
        }

        const newTravelogue = new Travelogue({
            title,
            content,
            city,
            country,
            placesToVisit,
            author: authorId,
            authorName
        });

        await newTravelogue.save();
        res.status(201).json(newTravelogue);

    } catch (error) {
        console.error("Gezi yazısı ekleme hatası:", error);
        res.status(500).json({ message: "Gezi yazısı eklenirken bir hata oluştu.", error: error.message });
    }
});

app.get('/travelogue/:travelogueId', async (req, res) => {
    try {
        const travelogue = await Travelogue.findById(req.params.travelogueId);
        
        if (!travelogue) {
            return res.status(404).json({ message: "Gezi yazısı bulunamadı" });
        }
        res.status(200).json(travelogue);
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

app.put('/travelogue/:travelogueId', async (req, res) => {
    try {
        const { title, content, city, country, placesToVisit } = req.body;
        
        const updatedTravelogue = await Travelogue.findByIdAndUpdate(
            req.params.travelogueId,
            { title, content, city, country, placesToVisit, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedTravelogue) {
            return res.status(404).json({ message: "Gezi yazısı bulunamadı" });
        }
        res.status(200).json(updatedTravelogue);
    } catch (error) {
        res.status(400).json({ message: "Geçersiz istek veya sunucu hatası.", error: error.message });
    }
});

app.delete('/travelogue/:travelogueId', async (req, res) => {
    try {
        const deletedTravelogue = await Travelogue.findByIdAndDelete(req.params.travelogueId);
        
        if (!deletedTravelogue) {
            return res.status(404).json({ message: "Gezi yazısı bulunamadı" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: "Geçersiz ID formatı veya sunucu hatası." });
    }
});

app.get('/travelogue', async (req, res) => {
    try {
        const { city, country, limit = 10, page = 1 } = req.query;
        
        let filter = {};
        if (city) filter.city = new RegExp(city, 'i');
        if (country) filter.country = new RegExp(country, 'i');

        const skip = (page - 1) * limit;

        const travelogues = await Travelogue.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }); 

        res.status(200).json(travelogues);
    } catch (error) {
        res.status(500).json({ message: "Yazılar getirilirken bir hata oluştu.", error: error.message });
    }
});

app.post('/ratings/:cityid', async (req, res) => {
    try {
        const cityId = req.params.cityid;
        
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

app.post('/users/:userid/favorites', async (req, res) => {
    try {
        const userId = req.params.userid;
        const { type, itemId } = req.body; 

        if (!type || !itemId) {
            return res.status(400).json({ message: "Tip (type) ve Öğe (itemId) zorunludur." });
        }

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

app.get('/users/:userid/favorites', async (req, res) => {
    try {
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

app.put('/auth/users/:userid/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.params.userid);
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        if (user.password !== currentPassword) {
            return res.status(401).json({ message: "Mevcut şifreniz hatalı!" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Şifre başarıyla güncellendi!" });
    } catch (error) {
        res.status(500).json({ message: "Şifre güncellenirken hata oluştu.", error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Yerel sunucu ${PORT} portunda çalışıyor...`);
    });
}

module.exports = app;