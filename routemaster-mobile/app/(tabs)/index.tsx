import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();


  const fetchPosts = () => {
    const API_URL = 'http://10.34.47.203:3000/travelogue'; 

    axios.get(API_URL)
      .then(response => {
        setPosts(response.data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        console.error("Veri çekme hatası:", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

// Sayfaya her odaklanıldığında (geri gelindiğinde) çalışır
useFocusEffect(
    useCallback(() => {
      // 1. AŞAMA: Ekrana "Yükleniyor" animasyonunu sok veya listeyi zorla boşalt
      // setPosts([]); // Eğer state ismin posts ise bunu kullan
      setLoading(true); 

      // 2. AŞAMA: Verileri sunucudan sıfırdan çek
      fetchPosts(); // (Kendi fonksiyon ismin neyse o)
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true); 
    fetchPosts();
  };

  const renderItem = ({ item }: { item: Travelogue }) => (
    <TouchableOpacity 
    style={styles.card} 
    onPress={() => router.push({ 
  pathname: "/detail/[id]", 
  params: { id: item._id } 
})} // Tıklananın ID'sini gönder
  >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>📍 {item.city}, {item.country}</Text>
      <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
      <Text style={styles.author}>✍️ Yazar: {item.authorName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Rotalar Yükleniyor...</Text>
      </View>
    );
  }

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const cityMatch = post.city && post.city.toLowerCase().includes(query);
    const countryMatch = post.country && post.country.toLowerCase().includes(query);
    const titleMatch = post.title && post.title.toLowerCase().includes(query);
    return cityMatch || countryMatch || titleMatch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Şehir, ülke veya başlık ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#e67e22']} 
            tintColor="#e67e22" 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aradığınız kriterlere uygun rota bulunamadı.</Text>
          </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    marginTop: 15,
    paddingHorizontal: 15,
    borderRadius: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  }
});