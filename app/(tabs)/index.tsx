import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
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
        </View>
    );
}