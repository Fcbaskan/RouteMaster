const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    bio: { type: String },
    avatarUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

var travelogueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    authorName: { type: String, required: true },
    placesToVisit: [ String ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

var cityRatingSchema = new mongoose.Schema({
    cityId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

var favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['travelogue', 'city'], required: true }, // Ne favorilendi?
    itemId: { type: String, required: true }, // Gezi yazısı ID'si veya Şehir adı
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'users');
const Travelogue = mongoose.model('Travelogue', travelogueSchema, 'travelogues');
const CityRating = mongoose.model('CityRating', cityRatingSchema, 'cityratings');
const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites');

module.exports = { User, Travelogue, CityRating, Favorite };