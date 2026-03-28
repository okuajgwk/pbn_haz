import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { auth } from '../firebaseConfig';
import { useAuthStore } from '../store/authStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { setUser, setLoading, isLoading, user } = useAuthStore();

  useEffect(() => {
    // Firebase verifică automat dacă există un token salvat pe dispozitiv.
    // Această funcție rulează imediat la pornire și ori de câte ori
    // starea de autentificare se schimbă (login, logout).
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Curățăm listener-ul la distrugerea componentei
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const onCameraScreen = segments[0] === 'cameraScreen';
    const onAuthScreens = segments[0] === 'login' || segments[0] === 'signup';

    if (user && !onCameraScreen) {
      router.replace('/cameraScreen');
    } else if (!user && !onAuthScreens && segments[0] !== '(tabs)') {
      router.replace('/');
    }
}, [isLoading, segments, user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Tab-urile (Index + Explore) — publice */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Ecrane fără tab bar și fără header */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="cameraScreen" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}