# API Tasarımı - OpenAPI Specification Örneği

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış örnek bir API tasarımını içermektedir.

## Genel Bakış

Bu örnek, bir e-ticaret platformu için kullanıcı ve ürün yönetimi API'sini göstermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: RouteMaster API
  version: 1.0.0
  description: >
    Bu API, RouteMaster platformu için tasarlanmış bir RESTful servistir. Kullanıcıların
    kayıt olmasına, gezi yazıları (travelogue) oluşturmasına, şehirleri puanlamasına
    ve favorilerini yönetmesine olanak tanır. API, JWT tabanlı kimlik doğrulama ile korunmaktadır.
  contact:
    name: RouteMaster
    email: support@routemaster.com

servers:
  - url: https://api.routemaster.com
    description: Üretim sunucusu (Production)
  - url: https://staging-api.routemaster.com
    description: Test sunucusu (Staging)
  - url: https://localhost:3000
    description: Yerel geliştirme sunucusu (Development)

tags:
  - name: Kullanıcılar
    description: Kullanıcı kaydı, profil ve hesap işlemleri
  - name: Gezi Yazıları
    description: Gezi yazısı oluşturma, görüntüleme, güncelleme ve silme işlemleri
  - name: Şehirler
    description: Şehir bazlı gönderiler ve şehir puanlama işlemleri
  - name: Favoriler
    description: Kullanıcı favori işlemleri

security:
  - BearerAuth: []

paths:
  /auth/register:
    post:
      tags:
        - Kullanıcılar
      summary: Kullanıcı Kaydı
      operationId: registerUser
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegistrationInput'
      responses:
        "201":
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "409":
          description: Bu e-posta adresi zaten kayıtlı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/users/{userid}/password:
    parameters:
      - name: userid
        in: path
        required: true
        description: Kullanıcının benzersiz kimlik numarası
        schema:
          type: string
        example: "usr123"

    put:
      tags:
        - Kullanıcılar
      summary: Şifre Güncelle
      operationId: updatePassword
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PasswordUpdateInput'
      responses:
        "200":
          description: Şifre başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Success'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{userid}:
    get:
      tags:
        - Kullanıcılar
      summary: Profil Getir
      operationId: getProfile
      responses:
        "200":
          description: Profil başarıyla getirildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Profil bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Kullanıcılar
      summary: Profil Güncelle
      operationId: updateProfile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProfileUpdateInput'
      responses:
        "200":
          description: Profil başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Profil bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/users/{userid}:
    parameters:
      - name: userid
        in: path
        required: true
        description: Kullanıcının benzersiz kimlik numarası
        schema:
          type: string
        example: "usr123"

    delete:
      tags:
        - Kullanıcılar
      summary: Hesap Sil
      operationId: deleteAccount
      responses:
        "204":
          description: Hesap başarıyla silindi
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /travelogue:
    post:
      tags:
        - Gezi Yazıları
      summary: Gezi Yazısı Ekle
      operationId: addTravelogue
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TravelogueInput'
      responses:
        "201":
          description: Gezi yazısı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Travelogue'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    get:
      tags:
        - Gezi Yazıları
      summary: Gezi Yazılarını Listele
      operationId: listTravelogues
      parameters:
        - name: city
          in: query
          required: false
          description: Filtreleme için şehir adı veya ID
          schema:
            type: string
          example: "Istanbul"
        - name: country
          in: query
          required: false
          description: Filtreleme için ülke adı
          schema:
            type: string
          example: "Turkey"
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Gezi yazıları başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Travelogue'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /travelogue/{travelogueId}:
    parameters:
      - name: travelogueid
        in: path
        required: true
        description: Gezi yazısının benzersiz kimlik numarası
        schema:
          type: string
        example: "tl456"

    get:
      tags:
        - Gezi Yazıları
      summary: Gezi Yazısı Detayı Getir
      operationId: getTravelogue
      responses:
        "200":
          description: Gezi yazısı başarıyla getirildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Travelogue'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Gezi yazısı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags:
        - Gezi Yazıları
      summary: Gezi Yazısı Güncelle
      operationId: updateTravelogue
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TravelogueInput'
      responses:
        "200":
          description: Gezi yazısı başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Travelogue'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Gezi yazısı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags:
        - Gezi Yazıları
      summary: Gezi Yazısı Sil
      operationId: deleteTravelogue
      responses:
        "204":
          description: Gezi yazısı başarıyla silindi
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Gezi yazısı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /travelogue?city={cityname}:
    parameters:
      - name: cityid
        in: path
        required: true
        description: Şehrin benzersiz kimlik numarası veya şehir adı
        schema:
          type: string
        example: "istanbul"

    get:
      tags:
        - Şehirler
      summary: Şehir Bazlı Gönderileri Listele
      operationId: listCityTravelogues
      parameters:
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Şehir bazlı gönderiler başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Travelogue'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Şehir bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /ratings:
    parameters:
      - name: cityid
        in: path
        required: true
        description: Şehrin benzersiz kimlik numarası veya şehir adı
        schema:
          type: string
        example: "istanbul"

    post:
      tags:
        - Şehirler
      summary: Şehir Puanla
      operationId: rateCity
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CityRatingInput'
      responses:
        "201":
          description: Şehir puanlaması başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CityRating'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Şehir bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /usrs/{userid}/favorites:
    get:
      tags:
        - Favoriler
      summary: Favorileri Getir
      operationId: getFavorites
      parameters:
        - name: type
          in: query
          required: false
          description: Filtre tipi (travelogue veya city)
          schema:
            type: string
            enum:
              - travelogue
              - city
          example: "travelogue"
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Favoriler başarıyla getirildi
          content:
            application/json:
              schema:
                type: array
                items:
                  oneOf:
                    - $ref: '#/components/schemas/Travelogue'
                    - $ref: '#/components/schemas/FavoriteCity'
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  securitySchemes:
    BearerAuth:
      type: apiKey
      in: header
      name: Authorization
      description: 'JWT tabanlı kimlik doğrulama. İstek başlığına "Authorization: Bearer <token>" eklenmeli.'

  schemas:
    User:
      type: object
      description: Kullanıcı bilgilerini temsil eden model
      properties:
        _id:
          type: string
          description: Kullanıcının benzersiz kimlik numarası (otomatik atanır)
          example: "usr123"
        username:
          type: string
          description: Kullanıcı adı
          example: "traveler_ahmet"
        email:
          type: string
          format: email
          description: E-posta adresi
          example: "ahmet@example.com"
        displayName:
          type: string
          description: Görüntülenen ad
          example: "Ahmet Yılmaz"
        createdAt:
          type: string
          format: date-time
          description: Kayıt tarihi (ISO 8601 formatında)
          example: "2026-03-01T10:00:00Z"
      required:
        - username
        - email

    UserRegistrationInput:
      type: object
      description: Kullanıcı kaydı için gönderilecek veri
      properties:
        username:
          type: string
          description: Kullanıcı adı
          minLength: 3
          maxLength: 30
          example: "traveler_ahmet"
        email:
          type: string
          format: email
          description: E-posta adresi
          example: "ahmet@example.com"
        password:
          type: string
          format: password
          description: Şifre
          minLength: 6
          example: "securePass123"
        displayName:
          type: string
          description: Görüntülenen ad
          minLength: 2
          maxLength: 50
          example: "Ahmet Yılmaz"
      required:
        - username
        - email
        - password

    UserProfile:
      type: object
      description: Kullanıcı profil bilgilerini temsil eden model
      properties:
        _id:
          type: string
          description: Kullanıcının benzersiz kimlik numarası
          example: "usr123"
        username:
          type: string
          description: Kullanıcı adı
          example: "traveler_ahmet"
        email:
          type: string
          format: email
          description: E-posta adresi
          example: "ahmet@example.com"
        displayName:
          type: string
          description: Görüntülenen ad
          example: "Ahmet Yılmaz"
        bio:
          type: string
          description: Kullanıcı hakkında bilgi
          example: "Gezi tutkunu, 20'den fazla ülke gezdim."
        avatarUrl:
          type: string
          format: uri
          description: Profil fotoğrafı URL'si
        createdAt:
          type: string
          format: date-time
          description: Kayıt tarihi (ISO 8601 formatında)
          example: "2026-03-01T10:00:00Z"

    ProfileUpdateInput:
      type: object
      description: Profil güncelleme için gönderilecek veri
      properties:
        displayName:
          type: string
          description: Görüntülenen ad
          minLength: 2
          maxLength: 50
          example: "Ahmet Yılmaz"
        bio:
          type: string
          description: Kullanıcı hakkında bilgi
          maxLength: 500
          example: "Gezi tutkunu"
        avatarUrl:
          type: string
          format: uri
          description: Profil fotoğrafı URL'si

    PasswordUpdateInput:
      type: object
      description: Şifre güncelleme için gönderilecek veri
      properties:
        currentPassword:
          type: string
          format: password
          description: Mevcut şifre
          example: "oldPass123"
        newPassword:
          type: string
          format: password
          description: Yeni şifre
          minLength: 6
          example: "newSecurePass456"
      required:
        - currentPassword
        - newPassword

    Travelogue:
      type: object
      description: Gezi yazısı bilgilerini temsil eden model
      properties:
        _id:
          type: string
          description: Gezi yazısının benzersiz kimlik numarası (otomatik atanır)
          example: "tl456"
        title:
          type: string
          description: Yazının başlığı
          example: "İstanbul'da 3 Günlük Macera"
        content:
          type: string
          description: Yazının içeriği ve deneyimler
          example: "İstanbul'da gezilecek yerler, yemek önerileri..."
        city:
          type: string
          description: Şehir adı
          example: "Istanbul"
        country:
          type: string
          description: Ülke adı
          example: "Turkey"
        author:
          type: string
          description: Yazarın kullanıcı ID'si
          example: "usr123"
        authorName:
          type: string
          description: Yazarın görüntülenen adı
          example: "Ahmet Yılmaz"
        placesToVisit:
          type: array
          description: Önerilen gezilecek yerler
          items:
            type: string
          example: ["Ayasofya", "Kapalıçarşı", "Boğaz Turu"]
        createdAt:
          type: string
          format: date-time
          description: Oluşturulma tarihi (ISO 8601 formatında)
          example: "2026-03-05T14:30:00Z"
        updatedAt:
          type: string
          format: date-time
          description: Son güncelleme tarihi (ISO 8601 formatında)
          example: "2026-03-06T09:15:00Z"
      required:
        - title
        - content
        - city
        - country

    TravelogueInput:
      type: object
      description: Gezi yazısı oluşturma veya güncelleme isteği için gönderilecek veri
      properties:
        title:
          type: string
          description: Yazının başlığı
          minLength: 3
          maxLength: 200
          example: "İstanbul'da 3 Günlük Macera"
        content:
          type: string
          description: Yazının içeriği ve deneyimler
          minLength: 50
          example: "İstanbul'da gezilecek yerler, yemek önerileri ve deneyimlerim..."
        city:
          type: string
          description: Şehir adı
          minLength: 2
          maxLength: 100
          example: "Istanbul"
        country:
          type: string
          description: Ülke adı
          minLength: 2
          maxLength: 100
          example: "Turkey"
        placesToVisit:
          type: array
          description: Önerilen gezilecek yerler
          items:
            type: string
          example: ["Ayasofya", "Kapalıçarşı", "Boğaz Turu"]
      required:
        - title
        - content
        - city
        - country

    CityRating:
      type: object
      description: Şehir puanlaması bilgilerini temsil eden model
      properties:
        _id:
          type: string
          description: Puanlamanın benzersiz kimlik numarası
          example: "rat789"
        cityId:
          type: string
          description: Şehrin kimlik numarası
          example: "istanbul"
        userId:
          type: string
          description: Puanı veren kullanıcının ID'si
          example: "usr123"
        rating:
          type: integer
          description: Verilen puan (1-5 arası)
          minimum: 1
          maximum: 5
          example: 5
        createdAt:
          type: string
          format: date-time
          description: Oluşturulma tarihi (ISO 8601 formatında)
          example: "2026-03-08T12:00:00Z"
      required:
        - rating

    CityRatingInput:
      type: object
      description: Şehir puanlama isteği için gönderilecek veri
      properties:
        rating:
          type: integer
          description: Verilecek puan (1-5 arası)
          minimum: 1
          maximum: 5
          example: 5
      required:
        - rating

    FavoriteCity:
      type: object
      description: Favori şehir bilgisi
      properties:
        _id:
          type: string
          description: Favori kaydının kimlik numarası
        city:
          type: string
          description: Şehir adı
          example: "Istanbul"
        country:
          type: string
          description: Ülke adı
          example: "Turkey"

    Success:
      type: object
      description: Başarılı işlem yanıtı
      properties:
        message:
          type: string
          description: Başarı mesajı
          example: "İşlem başarıyla tamamlandı"

    Error:
      type: object
      description: Hata durumlarında döndürülen standart hata yanıtı
      properties:
        message:
          type: string
          description: Hatayı açıklayan mesaj
          example: "Gezi yazısı bulunamadı"
      required:
        - message

```
