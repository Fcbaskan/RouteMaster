const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const users = [];

app.post('/auth/register', (req, res) => {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Kullanıcı adı, e-posta ve şifre zorunludur!" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
    }

    const newUser = {
        _id: "usr" + Math.floor(Math.random() * 10000),
        username,
        email,
        password, 
        displayName: displayName || "",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

app.listen(PORT, () => {
    console.log(`RouteMaster API çalışıyor: http://localhost:${PORT}`);
});