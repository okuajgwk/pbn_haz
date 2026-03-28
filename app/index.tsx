import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
export default function HomeScreen() {
    const router = useRouter();
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#0a0a0a',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* TITLE */}
            <Text
                style={{
                    color: '#00ffcc',
                    fontSize: 28,
                    marginBottom: 40,
                    letterSpacing: 2,
                }}
            >
                iTEC: OVERRIDE
            </Text>

            {/* QUESTION */}
            <Text
                style={{
                    color: 'white',
                    fontSize: 20,
                    marginBottom: 30,
                }}
            >
                Are you a
            </Text>

            {/* VANDAL BUTTON */}
            <TouchableOpacity
                onPress={() => router.push('/scanner' as any)}
                style={{
                    borderWidth: 2,
                    borderColor: '#ff00ff',
                    paddingVertical: 15,
                    paddingHorizontal: 40,
                    marginBottom: 20,
                    transform: [{ skewX: '-10deg' }],
                }}
            >
                <Text
                    style={{
                        color: '#ff00ff',
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}
                >
                    VANDAL
                </Text>
            </TouchableOpacity>

            {/* ARTIST BUTTON */}
            <TouchableOpacity
                onPress={() => router.push('/login' as any)}
                style={{
                    borderWidth: 2,
                    borderColor: '#00ffff',
                    paddingVertical: 15,
                    paddingHorizontal: 40,
                    transform: [{ skewX: '-10deg' }],
                }}
            >
                <Text
                    style={{
                        color: '#00ffff',
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}
                >
                    ARTIST
                </Text>
            </TouchableOpacity>

            {/* BUTON SCANARE AFIȘ */}
            <TouchableOpacity
                onPress={() => router.push('/scanner' as any)}
                style={{
                    marginTop: 40,
                    borderWidth: 2,
                    borderColor: '#ffff00',
                    paddingVertical: 15,
                    paddingHorizontal: 40,
                    transform: [{ skewX: '-10deg' }],
                }}
            >
                <Text
                    style={{
                        color: '#ffff00',
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}
                >
                    SCAN POSTER
                </Text>
            </TouchableOpacity>

            {/* BUTON TEST CANVAS — șterge după testare */}
            <TouchableOpacity
                onPress={() => router.push('/test-canvas' as any)}
                style={{
                    marginTop: 40,
                    borderWidth: 1,
                    borderColor: '#555',
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                }}
            >
                <Text style={{ color: '#555', fontSize: 14 }}>
                    TEST CANVAS
                </Text>
            </TouchableOpacity>
        </View>
    );
}