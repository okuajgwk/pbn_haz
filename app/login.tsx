import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in both fields!");
      return;
    }
    Alert.alert("Success", `Ready to send ${username} to the backend!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ITEC: OVERRIDE</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <Button title="Login" onPress={handleLogin} color="#ff3366" />
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
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
});