import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Input'lar arası geçiş için ref'ler
  const lastNameRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // ⚠️ Kendi IP adresini buraya yazmayı unutma
  const API_URL = 'http://10.34.47.203:3000/auth/register';

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Kullanıcı adı, e-posta ve şifre zorunludur!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Harika!', 'Kaydın başarıyla oluşturuldu. Şimdi giriş yapabilirsin. 🎉');
        // Kayıt başarılıysa Giriş sayfasına yönlendir
        router.replace('/login');
      } else {
        Alert.alert('Kayıt Başarısız', data.message || 'Bir hata oluştu.');
      }
    } catch (error) {
      console.error('Kayıt Hatası:', error);
      Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamıyor. İnternetini veya IP adresini kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Aramıza Katıl</Text>
            <Text style={styles.subtitle}>Yeni rotalar keşfetmeye hazır mısın?</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Adınız</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Furkan Çağrı"
              value={firstName}
              onChangeText={setFirstName}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Soyadınız</Text>
            <TextInput
              ref={lastNameRef}
              style={styles.input}
              placeholder="Örn: Başkan"
              value={lastName}
              onChangeText={setLastName}
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Kullanıcı Adı *</Text>
            <TextInput
              ref={usernameRef}
              style={styles.input}
              placeholder="Kullanıcı adınızı belirleyin"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>E-Posta Adresi *</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="ornek@mail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.label}>Şifre *</Text>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten bir hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#e67e22',
    fontSize: 15,
    fontWeight: 'bold',
  },
});