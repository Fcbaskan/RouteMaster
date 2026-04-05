# Gereksinim Analizi

# Tüm Gereksinimler 

1. **Üye Olma** (Furkan Çağrı Başkan)
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Kullanıcıların sisteme yeni bir hesap oluşturarak kayıt olmasını sağlar. Ad, soyad, e-posta ve şifre gibi temel bilgilerin toplanıp veritabanına kaydedilmesini içerir. Hesap oluşturulduktan sonra kullanıcı sisteme giriş yapabilir duruma gelir.

2. **Kullanıcı Girişi** (Furkan Çağrı Başkan)
   - **API Metodu:** `POST /auth/login`
   - **Açıklama:** Kayıtlı kullanıcıların e-posta ve şifre ile sisteme giriş yapmasını sağlar.**

3. **Profil Getirme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /users/{userId}`
   - **Açıklama:** Belirli bir kullanıcının profil sayfasını ve genel bilgilerini görüntülemek için kullanılır. Ziyaretçiler diğer yazarların profillerini ve o güne kadar paylaştıkları yazıları bu uç nokta üzerinden inceleyebilir.

4. **Profil Güncelleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `PUT /users/{userId}`
   - **Açıklama:** Kullanıcının mevcut profil bilgilerini değiştirmesini sağlar. İsim, e-posta, biyografi veya profil fotoğrafı gibi alanlar güncellenebilir. Güvenlik için kullanıcının sisteme giriş yapmış (yetkilendirilmiş) olması gerekir ve herkes yalnızca kendi profilini güncelleyebilir.

5. **Şifreyi Güncelleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `PUT /auth/users/{userid}/password`
   - **Açıklama:** Kullanıcının mevcut hesap şifresini yeni bir şifre ile değiştirmesini sağlar. Güvenlik amacıyla eski şifrenin doğrulanmasını gerektirir. Kullanıcının güvenli bir şekilde giriş yapmış olması zorunludur.

6. **Hesap Silme** (Furkan Çağrı Başkan)
   - **API Metodu:** `DELETE /auth/users/{userId}`
   - **Açıklama:** Kullanıcının kendi hesabını platformdan kalıcı olarak silmesini sağlar. Bu işlem geri alınamaz ve kullanıcının kişisel verilerini sistemden temizler. Güvenlik için giriş yapmış olmak zorunludur.

7. **Yeni Gezi Yazısı Ekleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `POST /travelogue`
   - **Açıklama:** Kullanıcıların gezdiği bir ülke veya şehir hakkındaki deneyimlerini, mekan önerilerini ve anılarını sisteme eklemesini sağlar. İçeriğin veritabanına kaydedilebilmesi için kullanıcının üye girişi yapmış olması zorunludur.

8. **Tüm Gezi Yazılarını Listeleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /travelogue`
   - **Açıklama:** Platformdaki diğer gezginler tarafından paylaşılmış tüm gezi yazılarını (rotaları) listeler.

9. **Gezi Yazısı Detayını Görüntüleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /travelogue/{travelogueId}`
   - **Açıklama:** Belirli bir gezi yazısının tüm içeriğinin, yazar bilgilerinin ve (varsa) eklenen fotoğrafların detaylı olarak okunmasını sağlar. Bu işlem herkese açıktır, içeriği okumak için üye girişi gerektirmez.

10. **Gezi Yazısı Düzenleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `PUT /travelogue/{travelogueId}`
   - **Açıklama:** Daha önce paylaşılmış bir gezi yazısının başlık, içerik veya lokasyon gibi bilgilerinin güncellenmesini sağlar. Yalnızca yazıyı oluşturan yazar (veya yönetici yetkisi olanlar) bu işlemi gerçekleştirebilir, yetki kontrolü zorunludur.

11. **Gezi Yazısı Silme** (Furkan Çağrı Başkan)
    - **API Metodu:** `DELETE /travelogue/{travelogueId}`
    - **Açıklama:** Kullanıcının daha önce paylaştığı bir gezi yazısını ve ona bağlı verileri sistemden tamamen kaldırmasını sağlar. Yalnızca içeriğin sahibi tarafından yapılabilir. İşlem için giriş yapmış olmak gerekir.

12. **Yazıyı Puanlama** (Furkan Çağrı Başkan)
    - **API Metodu:** `POST /ratings/{userId}`
    - **Açıklama:** Kullanıcıların ziyaret ettikleri bir şehre veya okudukları bir deneyime puan vererek değerlendirme yapmasını sağlar. Bu veriler genel puan ortalamasını hesaplamak için veritabanına kaydedilir. İşlemi yapmak için sisteme giriş yapmış olmak gerekir.

13. **Yazı Puan Silme** (Furkan Çağrı Başkan)
    - **API Metodu:** `DELETE /ratings/{id}/{userId}`
    - **Açıklama:** Kullanıcının Yazısına Verdiği Puanı Silmesini Sağlar.

14. **Favori Ekleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `POST/favorites`
   - **Açıklama:** Kullanıcının beğendiği bir gezi yazısını kendi favori listesine eklemesini sağlar.

15. **Favorileri Listeleme** (Furkan Çağrı Başkan)
   - **API Metodu:** `GET /favorites/{userId}`
   - **Açıklama:** Belirli bir kullanıcının favorilerine eklediği tüm gezi yazılarını getirir.

16. **Favorilerden Çıkarma** (Furkan Çağrı Başkan)
   - **API Metodu:** `DELETE /favorites/{userId}`
   - **Açıklama:** Kullanıcının daha önce favorilerine eklediği bir gezi yazısını listeden çıkarmasını sağlar.


# Gereksinim Dağılımları

1. [Furkan Çağrı Başkan'ın Gereksinimleri](Furkan-Çağrı-Başkan/Furkan-Çağrı-Başkan-Gereksinimler.md)