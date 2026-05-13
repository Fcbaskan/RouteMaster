import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.90.251.203:3000';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Düzenleme
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', city: '', country: '', placesToVisit: '', content: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Favori
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Puanlama
  const [ratingData, setRatingData] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const API_URL = `${API_BASE}/travelogue/${id}`;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchAll = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          let user = null;
          if (storedUser) {
            user = JSON.parse(storedUser);
            if (isActive) setCurrentUser(user);
          }

          // Yazı detayı
          const response = await fetch(API_URL);
          if (response.ok) {
            const data = await response.json();
            if (isActive) {
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
                setPost(null);
              }
            }
          } else {
            if (isActive) setPost(null);
          }

          // Puan ve favori (kullanıcı varsa)
          if (user && id && isActive) {
            // Ortalama puan
            fetch(`${API_BASE}/ratings/${id}`)
              .then(r => r.json())
              .then(d => { if (isActive) setRatingData(d); })
              .catch(() => {});

            // Kullanıcının kendi puanı
            fetch(`${API_BASE}/ratings/${id}/${user._id}`)
              .then(r => r.json())
              .then(d => { 
                 if (isActive) {
                   if (d.rating !== null) setUserRating(d.rating); 
                   else setUserRating(null); // Fix: Reset to null if no rating
                 }
              })
              .catch(() => {});

            // Favoride mi?
            fetch(`${API_BASE}/favorites/${user._id}`)
              .then(r => r.json())
              .then((favs: any[]) => {
                if (isActive) {
                  const found = favs.some((f: any) => f.itemId === id || f.itemId === String(id));
                  setIsFavorite(found);
                }
              })
              .catch(() => {});
          }

        } catch (error) {
          console.error('Hata:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      if (id) fetchAll();

      return () => { isActive = false; };
    }, [id])
  );

  // ----- FAVORİ -----
  const handleToggleFavorite = async () => {
    if (!currentUser) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await fetch(`${API_BASE}/favorites/${id}/${currentUser._id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await fetch(`${API_BASE}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser._id, itemId: id, type: 'travelogue' }),
        });
        setIsFavorite(true);
      }
    } catch {
      Alert.alert('Hata', 'Favori işlemi başarısız.');
    } finally {
      setFavLoading(false);
    }
  };

  // ----- PUAN VER -----
  const handleRate = async (star: number) => {
    if (!currentUser) { Alert.alert('Hata', 'Puan vermek için giriş yapmalısınız.'); return; }
    setRatingLoading(true);
    try {
      // Önce mevcut puanı sil
      if (userRating !== null) {
        await fetch(`${API_BASE}/ratings/${id}/${currentUser._id}`, { method: 'DELETE' });
      }
      // Yeni puanı kaydet (aynı yıldıza tekrar basılırsa kaldır)
      if (star !== userRating) {
        await fetch(`${API_BASE}/ratings/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser._id, rating: star }),
        });
        setUserRating(star);
      } else {
        setUserRating(null);
      }
      // Güncel ortalama puanı al
      const res = await fetch(`${API_BASE}/ratings/${id}`);
      const d = await res.json();
      setRatingData(d);
    } catch (err: any) {
      console.error("Puan verme hatası:", err);
      Alert.alert('Hata', 'Puan işlemi sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setRatingLoading(false);
    }
  };

  // ----- SİL -----
  const handleDelete = () => {
    Alert.alert("Yazıyı Sil", "Bu işlemi geri alamazsınız. Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil", style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(API_URL, { method: 'DELETE' });
            if (res.ok) { Alert.alert("Başarılı", "Yazı silindi."); router.back(); }
          } catch { Alert.alert("Hata", "Silinemedi."); }
        }
      }
    ]);
  };

  // ----- GÜNCELLE -----
  const handleUpdate = async () => {
    setUpdateLoading(true);
    try {
      const placesArray = typeof editData.placesToVisit === 'string'
        ? editData.placesToVisit.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : editData.placesToVisit;

      const payload = { ...editData, placesToVisit: placesArray };

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
        setIsEditing(false);
        Alert.alert("Başarılı", "Yazınız güncellendi! ✏️");
      } else {
        Alert.alert("Hata", "Güncellenemedi.");
      }
    } catch {
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
      {/* Kapak Fotoğrafı */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.imageUrl || `https://picsum.photos/seed/${post._id}/800/600` }} style={styles.image} />
        {!isEditing && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {/* Favori butonu */}
        {!isEditing && currentUser && (
          <TouchableOpacity style={styles.favButton} onPress={handleToggleFavorite} disabled={favLoading}>
            {favLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color={isFavorite ? "#e74c3c" : "#fff"} />
            }
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

            {/* Ortalama Puan Göstergesi */}
            <View style={styles.avgRatingContainer}>
              <Ionicons name="star" size={20} color="#f39c12" />
              <Text style={styles.avgRatingText}>
                {ratingData.count > 0 ? ` ${ratingData.average} / 5` : ' Henüz puanlanmadı'}
              </Text>
              {ratingData.count > 0 && (
                <Text style={styles.avgRatingCount}> ({ratingData.count} oy)</Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Gezilecek Yerler */}
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
                    {index < arr.length - 1 && <Text style={styles.placeArrow}>→</Text>}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placesText}>Belirtilmemiş</Text>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Gezi Notları</Text>
            <Text style={styles.contentText}>{post.content}</Text>

            {/* ⭐ PUANLAMA */}
            {currentUser && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>⭐ Bu Geziyi Puanla</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => handleRate(star)} disabled={ratingLoading}>
                      <Ionicons
                        name={userRating !== null && star <= userRating ? "star" : "star-outline"}
                        size={38}
                        color={userRating !== null && star <= userRating ? "#f39c12" : "#ccc"}
                        style={{ marginHorizontal: 4 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {userRating && (
                  <Text style={styles.userRatingText}>Verdiğiniz puan: {userRating}/5 (Aynı yıldıza tekrar basarak kaldırabilirsiniz)</Text>
                )}
              </>
            )}

            {/* Yazar butonları */}
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
          /* ================= DÜZENLEME MODU ================= */
          <>
            <Text style={styles.sectionTitle}>Yazıyı Düzenle</Text>
            <TextInput style={styles.input} value={editData.title} onChangeText={(t) => setEditData({ ...editData, title: t })} placeholder="Başlık" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} value={editData.city} onChangeText={(t) => setEditData({ ...editData, city: t })} placeholder="Şehir" />
              <TextInput style={[styles.input, { flex: 1 }]} value={editData.country} onChangeText={(t) => setEditData({ ...editData, country: t })} placeholder="Ülke" />
            </View>
            <TextInput style={styles.input} value={editData.placesToVisit} onChangeText={(t) => setEditData({ ...editData, placesToVisit: t })} placeholder="Gezilecek Yerler (virgülle ayırın)" />
            <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={editData.content} onChangeText={(t) => setEditData({ ...editData, content: t })} multiline numberOfLines={5} placeholder="Gezi Notları" />
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
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { position: 'relative', width: '100%', height: 280 },
  image: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 45, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 22 },
  favButton: { position: 'absolute', top: 45, right: 20, backgroundColor: 'rgba(0,0,0,0.45)', padding: 10, borderRadius: 22 },
  contentContainer: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff', marginTop: -24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  locationText: { fontSize: 16, color: '#666', marginLeft: 5 },
  authorText: { fontSize: 14, color: '#888', fontStyle: 'italic', marginBottom: 8 },
  avgRatingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  avgRatingText: { fontSize: 16, fontWeight: '700', color: '#f39c12' },
  avgRatingCount: { fontSize: 13, color: '#999' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#e67e22', marginBottom: 12 },
  placesText: { fontSize: 15, color: '#888', fontStyle: 'italic' },
  placesContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  placeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e67e22' },
  placeText: { fontSize: 15, color: '#333', fontWeight: '500' },
  placeArrow: { fontSize: 18, color: '#e67e22', fontWeight: 'bold', marginHorizontal: 2 },
  contentText: { fontSize: 16, color: '#444', lineHeight: 26 },
  // Puanlama
  starsContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  userRatingText: { fontSize: 12, color: '#999', marginTop: 4, fontStyle: 'italic' },
  // Butonlar
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 13, borderRadius: 12, marginHorizontal: 5, gap: 6 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
});