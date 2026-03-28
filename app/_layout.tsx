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
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { setUser, setLoading, isLoading, user } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inMain = segments[0] === '(main)';
    const inCanvas = segments[0] === 'canvas';
    const inAuth = segments[0] === 'login' || segments[0] === 'signup';
    const inIndex = segments[0] === undefined || (segments[0] as string) === 'index';

    // Dacă userul e logat (ARTIST) și e pe index sau pe ecranele de auth
    // → trimite-l direct la scanner
    if (user && !user.isAnonymous && (inIndex || inAuth)) {
      router.replace('/(main)/scanner' as any);
      return;
    }

    // Dacă e pe un ecran protejat (team) fără cont → înapoi la index
    if ((!user || user.isAnonymous) && inMain && (segments[1] as string) === 'team') {
      router.replace('/(main)/scanner' as any);
      return;
    }
  }, [isLoading, segments, user]);

  if (isLoading) {
    // Ecran negru cât verifică Firebase tokenul salvat
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="canvas" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}