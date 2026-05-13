import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';;

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [placesToVisit, setPlacesToVisit] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const cityRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);
  const placesRef = useRef<TextInput>(null);
  const contentRef = useRef<TextInput>(null);

  const handleShare = async () => { 
    if (!title || !city || !country || !content) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);

    try {
      const storedUser = await AsyncStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) {
        Alert.alert("Hata", "Yazı paylaşmak için önce giriş yapmalısınız!");
        setLoading(false);
        return;
      }

      // Virgülle ayrılmış yerleri diziye çevir
      const placesArray = placesToVisit
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const newPost = {
        title,
        city,
        country,
        content,
        placesToVisit: placesArray,
        authorId: user._id,
        authorName: user.username
      };

      axios.post('http://10.34.47.203:3000/travelogue', newPost)
        .then(() => {
          Alert.alert('Harika! 🚀', 'Gezi yazınız başarıyla paylaşıldı.');
          setTitle('');
          setCity('');
          setCountry('');
          setPlacesToVisit('');
          setContent('');
          setLoading(false);
        })
        .catch(error => {
          console.error("Gönderme hatası:", error);
          Alert.alert('Hata', 'Yazı paylaşılırken bir sorun oluştu.');
          setLoading(false);
        });

    } catch (error) {
      console.error("Hafıza okuma hatası:", error);
      Alert.alert('Hata', 'Kullanıcı bilgileri okunamadı.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Yeni Rota Ekle</Text>

          <TextInput
            style={styles.input}
            placeholder="Başlık (Örn: Harika Bir Hafta Sonu)"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            onSubmitEditing={() => cityRef.current?.focus()}
            blurOnSubmit={false}
          />

          <View style={styles.row}>
            <TextInput
              ref={cityRef}
              style={[styles.input, { flex: 1, marginRight: 5 }]}
              placeholder="Şehir"
              value={city}
              onChangeText={setCity}
              returnKeyType="next"
              onSubmitEditing={() => countryRef.current?.focus()}
              blurOnSubmit={false}
            />
            <TextInput
              ref={countryRef}
              style={[styles.input, { flex: 1, marginLeft: 5 }]}
              placeholder="Ülke"
              value={country}
              onChangeText={setCountry}
              returnKeyType="next"
              onSubmitEditing={() => placesRef.current?.focus()}
              blurOnSubmit={false}
            />
          </View>

          <Text style={styles.fieldLabel}>🗺️ Gezilecek Yerler</Text>
          <TextInput
            ref={placesRef}
            style={styles.input}
            placeholder="Örn: Ayasofya, Topkapı Sarayı, Kapalıçarşı"
            value={placesToVisit}
            onChangeText={setPlacesToVisit}
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
            blurOnSubmit={false}
          />
          <Text style={styles.hint}>Birden fazla yer eklemek için virgül (,) kullanın</Text>

          <TextInput
            ref={contentRef}
            style={[styles.input, styles.textArea]}
            placeholder="Deneyimlerini anlat..."
            value={content}
            onChangeText={setContent}
            multiline={true}
            numberOfLines={6}
            returnKeyType="done"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleShare}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Paylaş 🚀</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});