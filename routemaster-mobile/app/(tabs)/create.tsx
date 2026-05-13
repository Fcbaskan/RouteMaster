import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      Alert.alert('Eksik Bilgi', 'Lütfen başlık, şehir, ülke ve deneyim alanlarını doldurun!');
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

      axios.post('http://10.90.251.203:3000/travelogue', newPost)
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Area */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Dünyayı Keşfet</Text>
            <Text style={styles.headerSubtitle}>Yeni bir gezi yazısı oluştur ve deneyimlerini paylaş.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            
            {/* Title Input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="text" size={20} color="#e67e22" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Başlık (Örn: Harika Bir Hafta Sonu)"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                onSubmitEditing={() => cityRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* City & Country Row */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Ionicons name="business" size={20} color="#e67e22" style={styles.icon} />
                <TextInput
                  ref={cityRef}
                  style={styles.input}
                  placeholder="Şehir"
                  placeholderTextColor="#999"
                  value={city}
                  onChangeText={setCity}
                  returnKeyType="next"
                  onSubmitEditing={() => countryRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                <Ionicons name="earth" size={20} color="#e67e22" style={styles.icon} />
                <TextInput
                  ref={countryRef}
                  style={styles.input}
                  placeholder="Ülke"
                  placeholderTextColor="#999"
                  value={country}
                  onChangeText={setCountry}
                  returnKeyType="next"
                  onSubmitEditing={() => placesRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* Places to Visit */}
            <View style={styles.inputWrapper}>
              <Ionicons name="map" size={20} color="#e67e22" style={styles.icon} />
              <TextInput
                ref={placesRef}
                style={styles.input}
                placeholder="Gezilecek Yerler (Virgülle ayırın)"
                placeholderTextColor="#999"
                value={placesToVisit}
                onChangeText={setPlacesToVisit}
                returnKeyType="next"
                onSubmitEditing={() => contentRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Content Textarea */}
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Ionicons name="journal" size={20} color="#e67e22" style={styles.iconTop} />
              <TextInput
                ref={contentRef}
                style={[styles.input, styles.textArea]}
                placeholder="Bu gezide neler yaşadın? Tavsiyelerin neler?"
                placeholderTextColor="#999"
                value={content}
                onChangeText={setContent}
                multiline={true}
                numberOfLines={8}
                returnKeyType="default"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleShare}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Hemen Paylaş</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 15,
    minHeight: 56,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 15,
  },
  icon: {
    marginRight: 10,
  },
  iconTop: {
    marginRight: 10,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  button: {
    backgroundColor: '#e67e22',
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#e67e22',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});