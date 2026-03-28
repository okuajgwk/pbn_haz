import { useState, useRef } from 'react';
import {
    View, Image, StyleSheet, TouchableOpacity,
    Text, PanResponder, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00', '#ffffff', '#ff6600'];
const STICKERS = ['🔥', '⚡', '💀', '👑', '🎨', '💥', '🌀'];

interface PathData {
    d: string;
    color: string;
    width: number;
}

interface Sticker {
    emoji: string;
    x: number;
    y: number;
}

export default function CanvasScreen() {
    const [paths, setPaths] = useState<PathData[]>([]);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const [selectedColor, setSelectedColor] = useState('#ff00ff');
    const [brushSize, setBrushSize] = useState(4);
    const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
    const [tool, setTool] = useState<'brush' | 'eraser' | 'sticker'>('brush');

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                const { locationX, locationY } = e.nativeEvent;
                if (tool === 'sticker' && selectedSticker) {
                    setStickers(prev => [...prev, {
                        emoji: selectedSticker,
                        x: locationX - 20,
                        y: locationY - 20,
                    }]);
                    return;
                }
                setCurrentPath(`M${locationX},${locationY}`);
            },
            onPanResponderMove: (e) => {
                if (tool === 'sticker') return;
                const { locationX, locationY } = e.nativeEvent;
                setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
            },
            onPanResponderRelease: () => {
                if (tool === 'sticker') return;
                if (currentPath) {
                    setPaths(prev => [...prev, {
                        d: currentPath,
                        color: tool === 'eraser' ? '#0a0a0a' : selectedColor,
                        width: tool === 'eraser' ? 20 : brushSize,
                    }]);
                    setCurrentPath('');
                }
            },
        })
    ).current;

    return (
        <View style={styles.container}>
            <View style={styles.canvasArea} {...panResponder.panHandlers}>
                <Image
                    source={require('../assets/images/afis1.png')}
                    style={styles.posterImage}
                    resizeMode="contain"
                />
                <Svg style={StyleSheet.absoluteFill}>
                    {paths.map((p, i) => (
                        <Path
                            key={i}
                            d={p.d}
                            stroke={p.color}
                            strokeWidth={p.width}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                    {currentPath ? (
                        <Path
                            d={currentPath}
                            stroke={tool === 'eraser' ? '#0a0a0a' : selectedColor}
                            strokeWidth={tool === 'eraser' ? 20 : brushSize}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : null}
                </Svg>
                {stickers.map((s, i) => (
                    <Text key={i} style={[styles.stickerOnCanvas, { left: s.x, top: s.y }]}>
                        {s.emoji}
                    </Text>
                ))}
            </View>

            <View style={styles.toolbar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    {COLORS.map(color => (
                        <TouchableOpacity
                            key={color}
                            onPress={() => { setSelectedColor(color); setTool('brush'); }}
                            style={[
                                styles.colorDot,
                                { backgroundColor: color },
                                selectedColor === color && tool === 'brush' && styles.selectedDot
                            ]}
                        />
                    ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <TouchableOpacity
                        onPress={() => setTool('brush')}
                        style={[styles.toolBtn, tool === 'brush' && styles.activeTool]}
                    >
                        <Text style={styles.toolText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTool('eraser')}
                        style={[styles.toolBtn, tool === 'eraser' && styles.activeTool]}
                    >
                        <Text style={styles.toolText}>🧹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setPaths([])}
                        style={styles.toolBtn}
                    >
                        <Text style={styles.toolText}>🗑️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.toolBtn}
                    >
                        <Text style={styles.toolText}>← Back</Text>
                    </TouchableOpacity>
                </View>

                {tool === 'brush' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        {[2, 4, 8, 16].map(size => (
                            <TouchableOpacity
                                key={size}
                                onPress={() => setBrushSize(size)}
                                style={[styles.toolBtn, brushSize === size && styles.activeTool]}
                            >
                                <View style={{
                                    width: size * 2,
                                    height: size * 2,
                                    borderRadius: size,
                                    backgroundColor: selectedColor
                                }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {STICKERS.map(emoji => (
                        <TouchableOpacity
                            key={emoji}
                            onPress={() => { setSelectedSticker(emoji); setTool('sticker'); }}
                            style={[styles.toolBtn, selectedSticker === emoji && tool === 'sticker' && styles.activeTool]}
                        >
                            <Text style={{ fontSize: 24 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    canvasArea: { flex: 1 },
    posterImage: { width: '100%', height: '100%' },
    toolbar: {
        backgroundColor: '#111',
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    colorDot: {
        width: 28, height: 28,
        borderRadius: 14,
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedDot: { borderColor: 'white', transform: [{ scale: 1.2 }] },
    toolBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        borderRadius: 6,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTool: { backgroundColor: '#444', borderWidth: 1, borderColor: '#fff' },
    toolText: { color: 'white', fontSize: 16 },
    stickerOnCanvas: {
        position: 'absolute',
        fontSize: 40,
    },
});