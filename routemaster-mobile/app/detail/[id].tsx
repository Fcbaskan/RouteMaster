import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // DÜZENLEME MODU STATE'LERİ
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', city: '', country: '', placesToVisit: '', content: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  // ⚠️ KENDİ BİLGİSAYARININ IP ADRESİNİ YAZMAYI UNUTMA
  const API_URL = `http://10.34.47.203:3000/travelogue/${id}`;

  useEffect(() => {
    const fetchUserAndDetail = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        const response = await fetch(API_URL);
        if (response.ok) {
            const data = await response.json();
            // Eğer veri gerçekten geldiyse state'e yaz
            if (data) {
              setPost(data);
              setEditData({
                title: data.title,
                city: data.city,
                country: data.country,
                placesToVisit: Array.isArray(data.placesToVisit) ? data.placesToVisit.join(', ') : (data.placesToVisit || ''),
                content: data.content
              });
            } else {
              setPost(null); // Veri boşsa null yap ki çökmesin
            }
        } else {
           setPost(null); // Hata kodu döndüyse (404) null yap
        }
      } catch (error) {
        console.error('Hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserAndDetail();
  }, [id]);

  // YAZIYI SİL
  const handleDelete = () => {
    Alert.alert("Yazıyı Sil", "Bu işlemi geri alamazsınız. Emin misiniz?", [
        { text: "İptal", style: "cancel" },
        { 
          text: "Sil", style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(API_URL, { method: 'DELETE' });
              if (res.ok) {
                Alert.alert("Başarılı", "Yazı silindi.");
                router.back();
              }
            } catch (err) { Alert.alert("Hata", "Silinemedi."); }
          }
        }
    ]);
  };

  // YAZIYI GÜNCELLE
  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const placesArray = typeof editData.placesToVisit === 'string'
        ? editData.placesToVisit.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : editData.placesToVisit;

      const payload = {
        ...editData,
        placesToVisit: placesArray
      };

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost); // Ekranı yeni veriyle güncelle
        setIsEditing(false);  // Düzenleme modundan çık
        Alert.alert("Başarılı", "Yazınız güncellendi! ✏️");
      } else {
        Alert.alert("Hata", "Güncellenemedi.");
      }
    } catch (error) {
      Alert.alert("Hata", "Sunucuya ulaşılamıyor.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#e67e22" /></View>;
  if (!post) return <View style={styles.centerContainer}><Text>Gezi yazısı bulunamadı.</Text></View>;

  const isAuthor = currentUser && post && String(currentUser._id).trim() === String(post.author).trim();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1' }} style={styles.image} />
        {!isEditing && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        
        {/* ================= NORMAL GÖRÜNÜM ================= */}
        {!isEditing ? (
          <>
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={18} color="#e67e22" />
              <Text style={styles.locationText}>{post.city}, {post.country}</Text>
            </View>
            <Text style={styles.authorText}>Yazar: {post.authorName || 'Bilinmiyor'}</Text>
            
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>🗺️ Gezilecek Yerler</Text>
            {post.placesToVisit && post.placesToVisit.length > 0 ? (
              <View style={styles.placesContainer}>
                {(Array.isArray(post.placesToVisit)
                  ? post.placesToVisit
                  : post.placesToVisit.split(',').map((p: string) => p.trim())
                ).map((yer: string, index: number, arr: string[]) => (
                  <View key={index} style={styles.placeRow}>
                    <View style={styles.placeDot} />
                    <Text style={styles.placeText}>{yer}</Text>
                    {index < arr.length - 1 && (
                      <Text style={styles.placeArrow}>→</Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placesText}>Belirtilmemiş</Text>
            )}
            
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Gezi Notları</Text>
            <Text style={styles.contentText}>{post.content}</Text>

            {isAuthor && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3498db' }]} onPress={() => setIsEditing(true)}>
                  <Ionicons name="pencil" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#e74c3c' }]} onPress={handleDelete}>
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          
        /* ================= DÜZENLEME MODU (FORM) ================= */
          <>
            <Text style={styles.sectionTitle}>Yazıyı Düzenle</Text>
            <TextInput style={styles.input} value={editData.title} onChangeText={(text) => setEditData({...editData, title: text})} placeholder="Başlık" />
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} value={editData.city} onChangeText={(text) => setEditData({...editData, city: text})} placeholder="Şehir" />
              <TextInput style={[styles.input, { flex: 1 }]} value={editData.country} onChangeText={(text) => setEditData({...editData, country: text})} placeholder="Ülke" />
            </View>

            <TextInput style={styles.input} value={editData.placesToVisit} onChangeText={(text) => setEditData({...editData, placesToVisit: text})} placeholder="Gezilecek Yerler" />
            <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={editData.content} onChangeText={(text) => setEditData({...editData, content: text})} multiline numberOfLines={5} placeholder="Gezi Notları" />

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2ecc71' }]} onPress={handleUpdate} disabled={updateLoading}>
                {updateLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Kaydet</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#95a5a6' }]} onPress={() => setIsEditing(false)}>
                <Text style={styles.actionButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative', width: '100%', height: 250 },
  image: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  contentContainer: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#fff', marginTop: -20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  locationText: { fontSize: 16, color: '#666', marginLeft: 5 },
  authorText: { fontSize: 14, color: '#888', fontStyle: 'italic', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#e67e22', marginBottom: 10 },
  placesText: { fontSize: 16, color: '#444', lineHeight: 24, fontStyle: 'italic' },
  placesContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e67e22' },
  placeText: { fontSize: 15, color: '#333', fontWeight: '500' },
  placeArrow: { fontSize: 18, color: '#e67e22', fontWeight: 'bold', marginHorizontal: 2 },
  contentText: { fontSize: 16, color: '#333', lineHeight: 26 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 12, borderRadius: 10, marginHorizontal: 5 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 }
});