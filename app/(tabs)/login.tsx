
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage("Invalid email or password.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Succes", `Te-ai logat ca: ${userCredential.user.email}`);
      // Aici, mai târziu, vom pune codul să te mute pe ecranul "Explore"
    } catch (error: any) {
      // Dacă parola e greșită sau contul nu există
      setErrorMessage("Invalid email or password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ITEC: OVERRIDE</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>ACCESS SYSTEM</Text>
      </TouchableOpacity>
      

      <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.linkTextBold}>Sign Up here</Text>
        </Text>
      </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0a0a0a', 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 2,
  },
  input: {
    height: 55,
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff3366', // Rozul cyberpunk
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30, // Spatiu intre buton si link-ul de inregistrare
    transform: [{ skewX: '-10deg' }], // Taiat la margini
  },
  loginButtonText: {
    color: '#ff3366',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  linkContainer: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#aaa',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#00ffff', // Cyan pentru a se asorta cu pagina de Sign Up
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff0033', // Un roșu aprins, de alarmă
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 14,
  },
});