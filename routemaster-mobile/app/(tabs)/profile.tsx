import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const API_BASE = 'http://10.90.251.203:3000';

export default function ProfileScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Favoriler
  const [favModalVisible, setFavModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  // Düzenleme form alanları
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const router = useRouter();

  useEffect(() => {
    loadUserData();
    fetchMyRoutes();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setEditFirstName(parsed.firstName || '');
        setEditLastName(parsed.lastName || '');
        setEditUsername(parsed.username || '');
        setEditEmail(parsed.email || '');
      }
    } catch (error) {
      console.error("Hafıza okuma hatası:", error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  const fetchMyRoutes = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) { setPosts([]); return; }
      const currentUser = JSON.parse(storedUser);
      const response = await fetch(`${API_BASE}/travelogue`);
      const data = await response.json();
      const myPosts = data.filter((post: any) => post.author === currentUser._id);
      setPosts(myPosts);
    } catch (error) {
      console.error('Profiller çekilirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      const res = await fetch(`${API_BASE}/favorites/${user._id}`);
      const favs = await res.json();

      // Her favorinin travelogue detayını çek
      const detailPromises = favs.map(async (fav: any) => {
        try {
          const r = await fetch(`${API_BASE}/travelogue/${fav.itemId}`);
          if (r.ok) return await r.json();
          return null;
        } catch { return null; }
      });

      const details = await Promise.all(detailPromises);
      setFavorites(details.filter(d => d !== null));
    } catch {
      Alert.alert('Hata', 'Favoriler yüklenemedi.');
    } finally {
      setFavLoading(false);
    }
  };

  const handleOpenFavorites = () => {
    setFavModalVisible(true);
    fetchFavorites();
  };

  const handleRemoveFavorite = async (postId: string) => {
    if (!user) return;
    try {
      await fetch(`${API_BASE}/favorites/${postId}/${user._id}`, { method: 'DELETE' });
      setFavorites(prev => prev.filter(p => p._id !== postId));
    } catch {
      Alert.alert('Hata', 'Favoriden çıkarılamadı.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMyRoutes();
    }, [])
  );

  const onRefresh = () => { setRefreshing(true); fetchMyRoutes(); };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: editFirstName, lastName: editLastName, username: editUsername, email: editEmail }),
      });
      if (response.ok) {
        const updatedUser = { ...user, firstName: editFirstName, lastName: editLastName, username: editUsername, email: editEmail };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        Alert.alert('✅ Başarılı', 'Profil bilgileriniz güncellendi!');
      } else {
        const data = await response.json();
        Alert.alert('Hata', data.message || 'Güncelleme başarısız.');
      }
    } catch {
      Alert.alert('Hata', 'Sunucuya ulaşılamıyor.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Hata', 'Mevcut ve yeni şifrenizi girin.');
      return;
    }
    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/users/${user._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('✅ Başarılı', 'Şifreniz güncellendi!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        Alert.alert('Hata', data.message || 'Şifre değiştirilemedi.');
      }
    } catch {
      Alert.alert('Hata', 'Sunucuya ulaşılamıyor.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('⚠️ Hesabı Sil', 'Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Evet, Sil', style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE}/auth/users/${user._id}`, { method: 'DELETE' });
            if (res.ok) {
              await AsyncStorage.removeItem('user');
              router.replace('/login');
            } else {
              Alert.alert('Hata', 'Hesap silinemedi.');
            }
          } catch {
            Alert.alert('Hata', 'Sunucuya ulaşılamıyor.');
          }
        }
      }
    ]);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
      <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'Misafir Kullanıcı'}</Text>
      <Text style={styles.userBio}>@{user ? user.username : 'misafir'} | Gezgin 🌍</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Rota</Text>
        </View>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: '#e74c3c' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.editButtonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      {/* Favorilerim Butonu */}
      <TouchableOpacity style={styles.favoritesButton} onPress={handleOpenFavorites}>
        <Ionicons name="heart" size={18} color="#e74c3c" style={{ marginRight: 8 }} />
        <Text style={styles.favoritesButtonText}>Favorilerim</Text>
        <Ionicons name="chevron-forward" size={18} color="#e74c3c" />
      </TouchableOpacity>

      <Text style={styles.myPostsLabel}>Yazılarım</Text>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item._id } })}>
      <Image source={{ uri: item.imageUrl || `https://picsum.photos/seed/${item._id}/400/200` }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <Text style={styles.postCity} numberOfLines={1}>{item.city || 'Belirtilmedi'}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#e67e22" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item: any, index) => item._id ? item._id.toString() : index.toString()}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#e67e22']} tintColor="#e67e22" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={50} color="#ddd" />
            <Text style={styles.emptyText}>Henüz bir gezi yazısı paylaşmadınız.</Text>
          </View>
        }
      />

      {/* ===== FAVORİLER MODAL ===== */}
      <Modal visible={favModalVisible} animationType="slide" onRequestClose={() => setFavModalVisible(false)}>
        <View style={styles.favModal}>
          {/* Header */}
          <View style={styles.favModalHeader}>
            <TouchableOpacity onPress={() => setFavModalVisible(false)}>
              <Ionicons name="arrow-back" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.favModalTitle}>❤️ Favorilerim</Text>
            <View style={{ width: 26 }} />
          </View>

          {favLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#e67e22" />
            </View>
          ) : favorites.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="heart-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>Henüz favori eklemediniz.</Text>
            </View>
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={(item: any) => item._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={styles.favCard}
                  onPress={() => { setFavModalVisible(false); router.push({ pathname: "/detail/[id]", params: { id: item._id } }); }}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.imageUrl || `https://picsum.photos/seed/${item._id}/400/200` }} style={styles.favCardImage} />
                  <View style={styles.favCardContent}>
                    <Text style={styles.favCardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.favCardLocation}>📍 {item.city}, {item.country}</Text>
                    <Text style={styles.favCardAuthor}>✍️ {item.authorName}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFavBtn}
                    onPress={() => handleRemoveFavorite(item._id)}
                  >
                    <Ionicons name="heart-dislike" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* ===== PROFİL DÜZENLEME MODAL ===== */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.modalContainer} keyboardShouldPersistTaps="handled">

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>👤 Kişisel Bilgiler</Text>
            <TextInput style={styles.input} placeholder="Ad" placeholderTextColor="#999" value={editFirstName} onChangeText={setEditFirstName} />
            <TextInput style={styles.input} placeholder="Soyad" placeholderTextColor="#999" value={editLastName} onChangeText={setEditLastName} />
            <TextInput style={styles.input} placeholder="Kullanıcı Adı" placeholderTextColor="#999" value={editUsername} onChangeText={setEditUsername} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="E-Posta" placeholderTextColor="#999" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saveLoading}>
              {saveLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Bilgileri Kaydet</Text>}
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>🔒 Şifre Değiştir</Text>
            <TextInput style={styles.input} placeholder="Mevcut Şifre" placeholderTextColor="#999" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Yeni Şifre" placeholderTextColor="#999" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#3498db' }]} onPress={handleChangePassword} disabled={saveLoading}>
              <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>⚠️ Tehlikeli Bölge</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.deleteButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingBottom: 20 },
  emptyContainer: { padding: 40, alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#aaa', fontSize: 15, textAlign: 'center', marginTop: 12 },
  headerContainer: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 5, paddingHorizontal: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#e67e22', marginBottom: 10 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  userBio: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 14 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 20, marginBottom: 14 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 2 },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e67e22', paddingVertical: 9, paddingHorizontal: 18, borderRadius: 20 },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  favoritesButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff5f5', borderWidth: 1.5, borderColor: '#e74c3c', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, marginBottom: 16 },
  favoritesButtonText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14, flex: 1 },
  myPostsLabel: { fontSize: 16, fontWeight: '700', color: '#2c3e50', alignSelf: 'flex-start', marginTop: 4, marginBottom: 6 },
  gridItem: { flex: 1, margin: 5, height: 150, borderRadius: 10, overflow: 'hidden' },
  postImage: { width: '100%', height: '100%' },
  postOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5 },
  postCity: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  // Favoriler Modal
  favModal: { flex: 1, backgroundColor: '#f8f9fa' },
  favModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 55, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  favModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  favCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  favCardImage: { width: 90, height: 90 },
  favCardContent: { flex: 1, padding: 12, justifyContent: 'center' },
  favCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50', marginBottom: 3 },
  favCardLocation: { fontSize: 12, color: '#e67e22', marginBottom: 3 },
  favCardAuthor: { fontSize: 11, color: '#999', fontStyle: 'italic' },
  removeFavBtn: { padding: 12, justifyContent: 'center', alignItems: 'center' },
  // Profil Düzenleme Modal
  modalContainer: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#e67e22', marginBottom: 12, marginTop: 4 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 12 },
  saveButton: { backgroundColor: '#e67e22', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  deleteButton: { backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});