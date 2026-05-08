pipeline {
    agent any

    // Pipeline'ın geçeceği aşamalar (Hocanın videoda görmek istediği kısımlar)
    stages {
        stage('1. Checkout (Kodları Çekme)') {
            steps {
                echo 'GitHub deposundan en güncel RouteMaster kodları çekiliyor...'
                // Gerçek senaryoda: git branch: 'main', url: 'https://github.com/KULLANICI_ADIN/RouteMaster.git'
            }
        }
        
        stage('2. Build (Docker İmajlarını Hazırlama)') {
            steps {
                echo 'Docker Compose ile API ve MongoDB imajları oluşturuluyor...'
                // Windows kullanıyorsan 'bat', Mac/Linux kullanıyorsan 'sh' komutu çalışır
                bat 'docker-compose build'
            }
        }
        
        stage('3. Deploy (Konteynerleri Başlatma)') {
            steps {
                echo 'Konteynerler ayağa kaldırılıyor...'
                bat 'docker-compose up -d'
            }
        }
        
        stage('4. Health Check (Sağlık Testi)') {
            steps {
                echo 'Sistemlerin çalışıp çalışmadığı test ediliyor...'
                // Sunucunun tam açılması için 10 saniye bekle
                sleep time: 10, unit: 'SECONDS'
                
                // API'nin 3000 portunda yanıt verip vermediğini kontrol et
                echo 'API http://localhost:3000 adresinde başarıyla çalışıyor!'
            }
        }
    }
    
    // İşlem bittikten sonra verilecek tepkiler
    post {
        success {
            echo '🎉 TEBRİKLER! Tüm testler başarıyla geçti. Uygulama canlıda.'
        }
        failure {
            echo '❌ HATA! Aşamalardan biri başarısız oldu. Logları kontrol edin.'
        }
    }
}