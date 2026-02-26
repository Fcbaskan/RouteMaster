# Gereksinim Analizi

# Tüm Gereksinimler 

1. **Üye Olma** (Furkan Çağrı Başkan)
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Kullanıcıların sisteme yeni bir hesap oluşturarak kayıt olmasını sağlar. Ad, soyad, e-posta ve şifre gibi temel bilgilerin toplanıp veritabanına kaydedilmesini içerir. Hesap oluşturulduktan sonra kullanıcı sisteme giriş yapabilir duruma gelir.

2. **Profil Getirme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /users/{userId}`
   - **Açıklama:** Belirli bir kullanıcının profil sayfasını ve genel bilgilerini görüntülemek için kullanılır. Ziyaretçiler diğer yazarların profillerini ve o güne kadar paylaştıkları yazıları bu uç nokta üzerinden inceleyebilir.

3. **Profil Güncelleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `PUT /users/{userId}`
   - **Açıklama:** Kullanıcının mevcut profil bilgilerini değiştirmesini sağlar. İsim, e-posta, biyografi veya profil fotoğrafı gibi alanlar güncellenebilir. Güvenlik için kullanıcının sisteme giriş yapmış (yetkilendirilmiş) olması gerekir ve herkes yalnızca kendi profilini güncelleyebilir.

4. **Şifreyi Güncelleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `PUT /auth/password`
   - **Açıklama:** Kullanıcının mevcut hesap şifresini yeni bir şifre ile değiştirmesini sağlar. Güvenlik amacıyla eski şifrenin doğrulanmasını gerektirir. Kullanıcının güvenli bir şekilde giriş yapmış olması zorunludur.

5. **Favori Getirme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /users/{userId}/favorites`
   - **Açıklama:** Kullanıcının daha önce beğendiği veya "Gidilecek Yerler" listesine eklediği gezi yazılarını listelemesini sağlar. Özel bir liste olduğu için sadece kullanıcının kendi favorilerini görebilmesi adına yetkilendirme (giriş yapma) şarttır.

6. **Hesap Silme** (Furkan Çağrı Başkan)
   - **API Metodu:** `DELETE /users/{userId}`
   - **Açıklama:** Kullanıcının kendi hesabını platformdan kalıcı olarak silmesini sağlar. Bu işlem geri alınamaz ve kullanıcının kişisel verilerini sistemden temizler. Güvenlik için giriş yapmış olmak zorunludur.

7. **Yeni Gezi Yazısı Ekleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `POST /posts`
   - **Açıklama:** Kullanıcıların gezdiği bir ülke veya şehir hakkındaki deneyimlerini, mekan önerilerini ve anılarını sisteme eklemesini sağlar. İçeriğin veritabanına kaydedilebilmesi için kullanıcının üye girişi yapmış olması zorunludur.

8. **Gezi Yazısı Detayını Görüntüleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /posts/{postId}`
   - **Açıklama:** Belirli bir gezi yazısının tüm içeriğinin, yazar bilgilerinin ve (varsa) eklenen fotoğrafların detaylı olarak okunmasını sağlar. Bu işlem herkese açıktır, içeriği okumak için üye girişi gerektirmez.

9. **Gezi Yazısı Düzenleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `PUT /posts/{postId}`
   - **Açıklama:** Daha önce paylaşılmış bir gezi yazısının başlık, içerik veya lokasyon gibi bilgilerinin güncellenmesini sağlar. Yalnızca yazıyı oluşturan yazar (veya yönetici yetkisi olanlar) bu işlemi gerçekleştirebilir, yetki kontrolü zorunludur.

10. **Gezi Yazısı Silme** (Furkan Çağrı Başkan)
    - **API Metodu:** `DELETE /posts/{postId}`
    - **Açıklama:** Kullanıcının daha önce paylaştığı bir gezi yazısını ve ona bağlı verileri sistemden tamamen kaldırmasını sağlar. Yalnızca içeriğin sahibi tarafından yapılabilir. İşlem için giriş yapmış olmak gerekir.

11. **Şehir Bazlı Yazıları Listeleme** (Furkan Çağrı Başkan)
    - **API Metodu:** `GET /posts?city={cityName}`
    - **Açıklama:** Kullanıcıların belirli bir şehre (örn: Roma, Paris) ait tüm gezi yazılarını listelemesini sağlar. Arama ve filtreleme işlemleri için kullanılır. Sisteme üye olmayan ziyaretçiler tarafından da serbestçe kullanılabilir.

12. **Şehir Puanlama** (Furkan Çağrı Başkan)
    - **API Metodu:** `POST /ratings`
    - **Açıklama:** Kullanıcıların ziyaret ettikleri bir şehre veya okudukları bir deneyime puan vererek değerlendirme yapmasını sağlar. Bu veriler genel puan ortalamasını hesaplamak için veritabanına kaydedilir. İşlemi yapmak için sisteme giriş yapmış olmak gerekir.


# Gereksinim Dağılımları

1. [Furkan Çağrı Başkan'ın Gereksinimleri](Furkan-Çağrı-Başkan/Furkan-Çağrı-Başkan-Gereksinimler.md)