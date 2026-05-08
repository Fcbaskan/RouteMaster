import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';

interface Travelogue {
  _id: string;
  title: string;
  content: string;
  city: string;
  country: string;
  authorName: string;
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Travelogue[]>([]);
  const [loading, setLoading] = useState(true); // İlk açılıştaki yükleme durumu
  const [refreshing, setRefreshing] = useState(false); // Kaydırarak yenileme durumu

  // Verileri çekme işlemini ayrı bir fonksiyona aldık
  const fetchPosts = () => {
    const API_URL = 'https://route-master-ten.vercel.app/travelogue'; 

    axios.get(API_URL)
      .then(response => {
        setPosts(response.data);
        setLoading(false);
        setRefreshing(false); // Yenileme bitince dönen ikonu durdur
      })
      .catch(error => {
        console.error("Veri çekme hatası:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  // Ekran İLK açıldığında verileri çek
  useEffect(() => {
    fetchPosts();
  }, []);

  // Ekran aşağı KAYDIRILDIĞINDA çalışacak fonksiyon
  const onRefresh = () => {
    setRefreshing(true); // Dönen ikonu başlat
    fetchPosts(); // Verileri baştan çek
  };

  const renderItem = ({ item }: { item: Travelogue }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>📍 {item.city}, {item.country}</Text>
      <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
      <Text style={styles.author}>✍️ Yazar: {item.authorName}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Rotalar Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        // İşte sihir burada gerçekleşiyor:
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#e67e22']} // Android için dönen ikonun rengi
            tintColor="#e67e22" // iOS için dönen ikonun rengi
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e67e22',
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  author: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'right',
  },
});