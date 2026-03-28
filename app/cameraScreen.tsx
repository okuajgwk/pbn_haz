import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen() {
  // Citim datele de pe avizierul Zustand!
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Îi spunem lui Firebase să distrugă jetonul
      await signOut(auth);
      // 2. Îl trimitem cu forța înapoi la Login
      router.replace('/');
    } catch (error: any) {
      Alert.alert("Eroare la deconectare", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SISTEM ACCESAT</Text>
      
      {/* Afișăm emailul jucătorului direct din Zustand */}
      <Text style={styles.subtitle}>
        Bun venit, agent: {user?.email}
      </Text>

      {/* Butonul de Deconectare */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>DECONECTARE (LOGOUT)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, color: '#00ffff', fontWeight: 'bold', marginBottom: 10, letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 40 },
  logoutButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ff3366', padding: 15, borderRadius: 5, transform: [{ skewX: '-10deg' }] },
  logoutButtonText: { color: '#ff3366', fontWeight: 'bold', fontSize: 16 }
});