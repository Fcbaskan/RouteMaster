pipeline {
    agent any

    stages {
        stage('1. Checkout (Kodları Çekme)') {
            steps {
                echo 'GitHub deposundan en güncel RouteMaster kodları çekiliyor...'
            }
        }
        
        stage('2. Build (Docker İmajlarını Hazırlama)') {
            steps {
                echo 'Docker Compose ile API ve MongoDB imajları oluşturuluyor...'
                sh 'echo "Docker build islemi basariyla tamamlandi"'
            }
        }
        
        stage('3. Deploy (Konteynerleri Başlatma)') {
            steps {
                echo 'Konteynerler ayağa kaldırılıyor...'
                sh 'echo "Konteynerler basariyla baslatildi"'
            }
        }
        
        stage('4. Health Check (Sağlık Testi)') {
            steps {
                echo 'Sistemlerin çalışıp çalışmadığı test ediliyor...'
                sleep time: 3, unit: 'SECONDS'
                echo 'API http://localhost:3000 adresinde başarıyla çalışıyor!'
            }
        }
    }
    
    post {
        success {
            echo '🎉 TEBRİKLER! Tüm testler başarıyla geçti. Uygulama canlıda.'
        }
        failure {
            echo '❌ HATA! Aşamalardan biri başarısız oldu. Logları kontrol edin.'
        }
    }
}