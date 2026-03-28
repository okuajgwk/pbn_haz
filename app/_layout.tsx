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
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const onAuthScreens = segments[0] === 'login' as any || segments[0] === 'signup' as any;
        const onProtectedScreens =
            segments[0] === 'cameraScreen' as any ||
            segments[0] === 'scanner' as any ||
            segments[0] === 'canvas' as any;

        if (!user && onProtectedScreens) {
            router.replace('/login' as any);
        } else if (!user && !onAuthScreens && segments[0] !== '(tabs)') {
            router.replace('/');
        }
    }, [isLoading, segments, user]);

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="signup" options={{ headerShown: false }} />
                <Stack.Screen name="cameraScreen" options={{ headerShown: false }} />
                <Stack.Screen name="scanner" options={{ headerShown: false }} />
                <Stack.Screen name="canvas" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}