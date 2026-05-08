# Temel imaj olarak Node.js'in en güncel halini alıyoruz
FROM node:latest

# Konteyner içindeki çalışma klasörümüzü belirliyoruz
WORKDIR /app

# Paket dosyalarını kopyalayıp bağımlılıkları kuruyoruz[cite: 1]
COPY package.json ./
RUN npm install

# Projenin geri kalan tüm dosyalarını kopyalıyoruz[cite: 1]
COPY . .

# Uygulamanın çalışacağı portu dışarı açıyoruz (Senin kodunda 3000'di)[cite: 1]
EXPOSE 3000

# Kapsayıcı çalıştığında uygulamayı başlatacak komut[cite: 1]
CMD ["npm", "start"]