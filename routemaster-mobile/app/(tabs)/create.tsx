import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = () => {
    if (!title || !city || !country || !content) {
      Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);

    const newPost = {
      title: title,
      city: city,
      country: country,
      content: content,
      authorId: "60d5ec49c1b3a324a0d9b5c2", 
      authorName: "Mobil Gezgin" 
    };

    axios.post('https://route-master-ten.vercel.app/travelogue', newPost)
      .then(response => {
        Alert.alert('Harika! 🚀', 'Gezi yazınız başarıyla paylaşıldı.');
        setTitle('');
        setCity('');
        setCountry('');
        setContent('');
        setLoading(false);
      })
      .catch(error => {
        console.error("Gönderme hatası:", error);
        Alert.alert('Hata', 'Yazı paylaşılırken bir sorun oluştu.');
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Yeni Rota Ekle</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Başlık (Örn: Harika Bir Hafta Sonu)" 
        value={title} 
        onChangeText={setTitle} 
      />
      
      <View style={styles.row}>
        <TextInput 
          style={[styles.input, { flex: 1, marginRight: 5 }]} 
          placeholder="Şehir" 
          value={city} 
          onChangeText={setCity} 
        />
        <TextInput 
          style={[styles.input, { flex: 1, marginLeft: 5 }]} 
          placeholder="Ülke" 
          value={country} 
          onChangeText={setCountry} 
        />
      </View>

      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Deneyimlerini anlat..." 
        value={content} 
        onChangeText={setContent} 
        multiline={true} 
        numberOfLines={6} 
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleShare} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Paylaş</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
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