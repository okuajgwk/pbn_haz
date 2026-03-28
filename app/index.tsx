import { useRouter } from 'expo-router';
import { signInAnonymously } from 'firebase/auth';
import { Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();

  // VANDAL — intră anonim, fără cont
  const handleVandal = async () => {
    try {
      await signInAnonymously(auth);
      // Auth guard din _layout.tsx nu îl redirecționează (e anonim)
      // Îl trimitem manual la scanner
      router.replace('/(main)/scanner' as any);
    } catch (error) {
      console.error('Eroare login anonim:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#00ffcc', fontSize: 28, marginBottom: 40, letterSpacing: 2 }}>
        iTEC: OVERRIDE
      </Text>

      <Text style={{ color: 'white', fontSize: 20, marginBottom: 30 }}>
        Are you a
      </Text>

      <TouchableOpacity
        onPress={handleVandal}
        style={{ borderWidth: 2, borderColor: '#ff00ff', paddingVertical: 15, paddingHorizontal: 40, marginBottom: 20, transform: [{ skewX: '-10deg' }] }}
      >
        <Text style={{ color: '#ff00ff', fontSize: 18, fontWeight: 'bold' }}>VANDAL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={{ borderWidth: 2, borderColor: '#00ffff', paddingVertical: 15, paddingHorizontal: 40, transform: [{ skewX: '-10deg' }] }}
      >
        <Text style={{ color: '#00ffff', fontSize: 18, fontWeight: 'bold' }}>ARTIST</Text>
      </TouchableOpacity>
    </View>
  );
}