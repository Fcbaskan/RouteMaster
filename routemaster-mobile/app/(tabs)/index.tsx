import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = 'http://10.90.251.203:3000';

interface Travelogue {
  _id: string;
  title: string;
  content: string;
  city: string;
  country: string;
  authorName: string;
  imageUrl?: string;
}

// Her kart için puan gösteren bileşen
function RatingBadge({ travelogueId }: { travelogueId: string }) {
  const [ratingData, setRatingData] = useState<{ average: number; count: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      fetch(`${API_BASE}/ratings/${travelogueId}`)
        .then(res => res.json())
        .then(data => {
          if (isActive) setRatingData(data);
        })
        .catch(() => {});
      return () => { isActive = false; };
    }, [travelogueId])
  );

  if (!ratingData || ratingData.count === 0) {
    return (
      <View style={ratingStyles.badge}>
        <Ionicons name="star-outline" size={13} color="#999" />
        <Text style={ratingStyles.noRatingText}> Puan yok</Text>
      </View>
    );
  }

  return (
    <View style={ratingStyles.badge}>
      <Ionicons name="star" size={13} color="#f39c12" />
      <Text style={ratingStyles.ratingText}> {ratingData.average} </Text>
      <Text style={ratingStyles.countText}>({ratingData.count})</Text>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#f39c12' },
  countText: { fontSize: 12, color: '#999' },
  noRatingText: { fontSize: 12, color: '#999' },
});

export default function FeedScreen() {
  const [posts, setPosts] = useState<Travelogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchPosts = () => {
    axios.get(`${API_BASE}/travelogue`)
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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPosts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (post.city && post.city.toLowerCase().includes(query)) ||
      (post.country && post.country.toLowerCase().includes(query)) ||
      (post.title && post.title.toLowerCase().includes(query))
    );
  });

  const renderItem = ({ item }: { item: Travelogue }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item._id } })}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.imageUrl || `https://picsum.photos/seed/${item._id}/400/200` }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.location}>📍 {item.city}, {item.country}</Text>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>✍️ {item.authorName}</Text>
          <RatingBadge travelogueId={item._id} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e67e22" />
          <Text style={{ marginTop: 10, color: '#999' }}>Rotalar Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Şehir, ülke veya başlık ara..."
          placeholderTextColor="#999"
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
            <Ionicons name="search-outline" size={50} color="#ddd" />
            <Text style={styles.emptyText}>Aradığınız kriterlere uygun rota bulunamadı.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e67e22',
    marginBottom: 6,
  },
  content: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  author: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
});