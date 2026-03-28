import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    // MODIFICAREA 1: Validare înainte de a trimite la Firebase
    if (!email || !password) {
      setErrorMessage("Invalid email or password.");
      return; // Oprește funcția aici, nu mai merge la Firebase
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Succes", "Cont creat cu succes!");
      router.replace('/login'); // Te trimite la meniul principal după succes
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage("Email already in use.");
      } 
      else if (error.code === 'auth/weak-password') {
        setErrorMessage("Password should be at least 6 characters.");
      } 
      else if (error.code === 'auth/invalid-email') {
        setErrorMessage("Invalid email address.");
      } 
      else {
        setErrorMessage("SYSTEM ERROR: " + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEW REBEL</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#888"
        // MODIFICAREA 2: Controlăm valoarea și tastatura
        value={email} 
        onChangeText={setEmail}
        autoCapitalize="none" // Oprește telefonul din a pune literă mare la începutul emailului
        keyboardType="email-address" // Arată '@' direct pe tastatură
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        placeholderTextColor="#888"
        // MODIFICAREA 3: Legăm valoarea
        value={password}
        onChangeText={setPassword}
      />

        {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
      </TouchableOpacity>

      {/* Buton de întoarcere la Login */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{color: '#aaa', marginTop: 20, textAlign: 'center'}}>
          Already have an account? Go back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, color: '#00ffff', textAlign: 'center', marginBottom: 40, fontWeight: 'bold' },
  input: { height: 55, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 10, paddingHorizontal: 20, marginBottom: 15 },
  button: { backgroundColor: '#00ffff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  errorText: {
    color: '#ff0033', // Roșu aprins pentru eroare
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 14,
  }
});