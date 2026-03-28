import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

interface DrawingToolsProps {
  /** Tool-ul selectat curent */
  tool: 'brush' | 'eraser';
  /** Grosimea curentă a pensulei */
  brushSize: number;
  /** Callback pentru schimbarea tool-ului */
  onToolChange: (tool: 'brush' | 'eraser') => void;
  /** Callback pentru schimbarea grosimii */
  onBrushSizeChange: (size: number) => void;
}

/** Opțiunile de grosime disponibile: mic / mediu / mare */
const SIZE_OPTIONS = [
  { label: 'S', value: 4 },
  { label: 'M', value: 8 },
  { label: 'L', value: 16 },
] as const;

/** Bara de instrumente pentru desenat — afișată jos pe ecran */
export default function DrawingTools({
  tool,
  brushSize,
  onToolChange,
  onBrushSizeChange,
}: DrawingToolsProps) {
  return (
    <View style={styles.container}>
      {/* Secțiunea cu butoanele de tool-uri */}
      <View style={styles.section}>
        {/* Buton pensulă */}
        <TouchableOpacity
          style={[styles.toolButton, tool === 'brush' && styles.activeButton]}
          onPress={() => onToolChange('brush')}
        >
          <Text style={[styles.toolIcon, tool === 'brush' && styles.activeText]}>
            ✏️
          </Text>
          <Text style={[styles.toolLabel, tool === 'brush' && styles.activeText]}>
            Pensulă
          </Text>
        </TouchableOpacity>

        {/* Buton radieră */}
        <TouchableOpacity
          style={[styles.toolButton, tool === 'eraser' && styles.activeButton]}
          onPress={() => onToolChange('eraser')}
        >
          <Text style={[styles.toolIcon, tool === 'eraser' && styles.activeText]}>
            🧽
          </Text>
          <Text style={[styles.toolLabel, tool === 'eraser' && styles.activeText]}>
            Radieră
          </Text>
        </TouchableOpacity>
      </View>

      {/* Separator vizual între secțiuni */}
      <View style={styles.divider} />

      {/* Secțiunea cu butoanele de grosime */}
      <View style={styles.section}>
        {SIZE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.sizeButton,
              brushSize === opt.value && styles.activeSizeButton,
            ]}
            onPress={() => onBrushSizeChange(opt.value)}
          >
            {/* Cercul care arată vizual grosimea */}
            <View
              style={[
                styles.sizePreview,
                {
                  width: opt.value,
                  height: opt.value,
                  borderRadius: opt.value / 2,
                  backgroundColor:
                    brushSize === opt.value ? '#fff' : 'rgba(255,255,255,0.5)',
                },
              ]}
            />
            <Text
              style={[
                styles.sizeLabel,
                brushSize === opt.value && styles.activeText,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Container principal — semi-transparent ca să se vadă camera */
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    gap: 8,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  /** Buton pentru tool (pensulă / radieră) */
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  /** Stil aplicat butonului activ */
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  toolIcon: {
    fontSize: 20,
  },
  toolLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  activeText: {
    color: '#fff',
  },
  /** Buton pentru selectarea grosimii */
  sizeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeSizeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  /** Cercul de previzualizare a grosimii */
  sizePreview: {
    marginBottom: 2,
  },
  sizeLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
