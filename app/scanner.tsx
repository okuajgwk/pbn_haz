import { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { CameraView, useCameraPermissions, CameraView as CameraViewType } from 'expo-camera';
import { router } from 'expo-router';

const GOOGLE_VISION_API_KEY = 'AIzaSyCbVzQ4SlqxHEhsoHIvDfFv2lW7fj2EY0w';

interface Poster {
    id: string;
    uri: number;
    label: string;
}

interface VisionLabel {
    description: string;
    score: number;
}

const KNOWN_POSTERS: Poster[] = [
    { id: 'afis_1', uri: require('../assets/images/afis1.png'), label: 'Poster' },
];

export default function ScannerScreen() {
    const cameraRef = useRef<CameraViewType>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [detectedPoster, setDetectedPoster] = useState<Poster | null>(null);
    const [scanning, setScanning] = useState(false);

    const scanFrame = async () => {
        if (!cameraRef.current || scanning) return;
        setScanning(true);

        try {
            const photo = await (cameraRef.current as any).takePictureAsync({
                base64: true,
                quality: 0.5,
            });

            const response = await fetch(
                `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requests: [{
                            image: { content: photo.base64 },
                            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }],
                        }],
                    }),
                }
            );

            const data = await response.json();
            const labels: VisionLabel[] = data.responses[0].labelAnnotations ?? [];
            console.log('LABELS:', JSON.stringify(labels));
            const matched = matchPoster(labels);

            if (matched) {
                setDetectedPoster(matched);
            } else {
                alert('Afiș nerecunoscut, încearcă din nou.\n\nLabels: ' + labels.map(l => l.description).join(', '));
            }

        } catch (err) {
            console.error(err);
            alert('Eroare: ' + err);
        } finally {
            setScanning(false);
        }
    };

    const matchPoster = (labels: VisionLabel[]): Poster | null => {
        for (const poster of KNOWN_POSTERS) {
            if (labels.some((l) => l.description.toLowerCase().includes(poster.label.toLowerCase()))) {
                return poster;
            }
        }
        return null;
    };

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Avem nevoie de acces la cameră</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Acordă permisiunea</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (detectedPoster) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>✅ Afiș detectat!</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/canvas' as any)}
                >
                    <Text style={styles.buttonText}>🎨 Deschide Canvas</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} />

            <TouchableOpacity style={styles.button} onPress={scanFrame}>
                <Text style={styles.buttonText}>
                    {scanning ? 'Se scanează...' : '📷 Scanează afișul'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.buttonText}>← Înapoi</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 20 },
    button: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,0,255,0.8)',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    text: { color: 'white', fontSize: 18, marginBottom: 20, textAlign: 'center' },
    poster: { width: '90%', height: 300, resizeMode: 'contain', marginBottom: 20 },
});