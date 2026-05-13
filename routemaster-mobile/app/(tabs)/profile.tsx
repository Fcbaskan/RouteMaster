import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const API_BASE = 'http://10.34.47.203:3000';

export default function ProfileScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

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

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.editButtonText}>Profili Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: '#e74c3c' }]} onPress={handleLogout}>
          <Text style={styles.editButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: "/detail/[id]", params: { id: item._id } })}>
      <Image source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' }} style={styles.postImage} />
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
      />

      {/* PROFİL DÜZENLEME MODAL */}
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
            <TextInput style={styles.input} placeholder="Ad" value={editFirstName} onChangeText={setEditFirstName} />
            <TextInput style={styles.input} placeholder="Soyad" value={editLastName} onChangeText={setEditLastName} />
            <TextInput style={styles.input} placeholder="Kullanıcı Adı" value={editUsername} onChangeText={setEditUsername} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="E-Posta" value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saveLoading}>
              {saveLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Bilgileri Kaydet</Text>}
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>🔒 Şifre Değiştir</Text>
            <TextInput style={styles.input} placeholder="Mevcut Şifre" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Yeni Şifre" value={newPassword} onChangeText={setNewPassword} secureTextEntry />

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
  headerContainer: { alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 5 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#e67e22', marginBottom: 10 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userBio: { fontSize: 14, color: '#666', marginTop: 5, marginBottom: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 20, marginBottom: 15 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 2 },
  editButton: { backgroundColor: '#e67e22', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  gridItem: { flex: 1, margin: 5, height: 150, borderRadius: 10, overflow: 'hidden' },
  postImage: { width: '100%', height: '100%' },
  postOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5 },
  postCity: { color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
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