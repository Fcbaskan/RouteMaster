import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ProfileScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Hafıza okuma hatası:", error);
      }
    };

    loadUserData();
    fetchMyRoutes();
  }, []);

  // Çıkış Yapma Fonksiyonu
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user'); // Hafızayı sil
    router.replace('/login'); // Giriş ekranına şutla
  };
  

  // ⚠️ DİKKAT: Buradaki IP adresini kendi güncel bilgisayar IP'n ile değiştirmeyi unutma!
  const API_URL = 'http://10.34.47.203:3000/travelogue';

  const fetchMyRoutes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      // Gerçek bir uygulamada burada sadece giriş yapan kullanıcının rotaları filtrelenir.
      // Şimdilik sistemdeki tüm rotaları kullanıcınınmış gibi gösteriyoruz.
      setPosts(data);
    } catch (error) {
      console.error('Profiller çekilirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

useFocusEffect(
    useCallback(() => {
      // 1. AŞAMA: Ekrana "Yükleniyor" animasyonunu sok veya listeyi zorla boşalt
      // setPosts([]); // Eğer state ismin posts ise bunu kullan
      setLoading(true); 

      // 2. AŞAMA: Verileri sunucudan sıfırdan çek
      fetchMyRoutes(); // (Kendi fonksiyon ismin neyse o)
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRoutes();
  };

  // Üst Kısım: Profil Bilgileri
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
        style={styles.avatar} 
      />
      {/* İSİM VE KULLANICI ADI ARTIK DİNAMİK */}
      <Text style={styles.userName}>
        {user ? `${user.firstName} ${user.lastName}` : 'Misafir Kullanıcı'}
      </Text>
      <Text style={styles.userBio}>
        @{user ? user.username : 'misafir'} | Gezgin 🌍
      </Text>
      
      {/* İstatistikler şimdilik sabit kalsın, sonra bağlarız */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Rota</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>

        {/* ÇIKIŞ YAP BUTONU */}
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: '#e74c3c' }]} 
          onPress={handleLogout}
        >
          <Text style={styles.editButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Alt Kısım: Rota Kartları (Izgara Görünümü)
  const renderItem = ({ item }) => (
    <TouchableOpacity 
    style={styles.gridItem}
    onPress={() => router.push({ 
  pathname: "/detail/[id]", 
  params: { id: item._id } 
})}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' }} 
        style={styles.postImage} 
      />
      <View style={styles.postOverlay}>
        <Text style={styles.postCity} numberOfLines={1}>{item.city || 'Belirtilmedi'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e67e22" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        numColumns={2} // Fotoğrafları yan yana 2'li dizer
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e67e22']}
            tintColor="#e67e22"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e67e22',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userBio: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: '#e67e22',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
  },
  postCity: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});