import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { DrawEvent } from '@/types';

interface PosterCanvasProps {
  /** Culoarea echipei curente — folosită pentru liniile proprii */
  teamColor: string;
  /** Grosimea pensulei (default: 4) */
  brushSize?: number;
  /** Tool-ul activ: pensulă normală sau radieră */
  tool: 'brush' | 'eraser';
  /** Callback apelat la finalul fiecărei linii desenate */
  onDrawLine: (event: DrawEvent) => void;
  /** Liniile primite de la ceilalți utilizatori prin socket */
  remoteLines: DrawEvent[];
}

/** Structura internă pentru o linie desenată local */
interface LocalLine {
  path: ReturnType<typeof Skia.Path.Make>;
  color: string;
  width: number;
}

export default function PosterCanvas({
  teamColor,
  brushSize = 4,
  tool,
  onDrawLine,
  remoteLines,
}: PosterCanvasProps) {
  /** Toate liniile desenate local, persistente pe canvas */
  const localLines = useRef<LocalLine[]>([]);
  /** Punctul de start al gestului curent */
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  /** Linia curentă (în curs de desenare) */
  const currentLine = useRef<LocalLine | null>(null);
  /** Forțează re-renderul canvas-ului */
  const [, setRenderTick] = React.useState(0);
  const forceRender = useCallback(() => setRenderTick((t) => t + 1), []);

  /** Calculează culoarea și grosimea în funcție de tool-ul activ */
  const getDrawStyle = useCallback(() => {
    if (tool === 'eraser') {
      return { color: 'rgba(0, 0, 0, 0.5)', width: brushSize * 3 };
    }
    return { color: teamColor, width: brushSize };
  }, [tool, teamColor, brushSize]);

  /** Creează un path Skia dintr-un DrawEvent (pentru linii remote) */
  const makePathFromEvent = useCallback((evt: DrawEvent) => {
    const p = Skia.Path.Make();
    p.moveTo(evt.x1, evt.y1);
    p.lineTo(evt.x2, evt.y2);
    return p;
  }, []);

  /** Când userul pune degetul pe ecran — memorează punctul de start */
  const handleTouchStart = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      startPoint.current = { x, y };

      const style = getDrawStyle();
      const path = Skia.Path.Make();
      path.moveTo(x, y);

      currentLine.current = {
        path,
        color: style.color,
        width: style.width,
      };
    },
    [getDrawStyle],
  );

  /** Când userul mișcă degetul — extinde linia curentă */
  const handleTouchMove = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (!currentLine.current) return;

      const { locationX: x, locationY: y } = e.nativeEvent;
      currentLine.current.path.lineTo(x, y);
      forceRender();
    },
    [forceRender],
  );

  /** Când userul ridică degetul — finalizează linia și apelează callback-ul */
  const handleTouchEnd = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (!startPoint.current || !currentLine.current) return;

      const { locationX: x, locationY: y } = e.nativeEvent;
      const style = getDrawStyle();

      // Salvează linia finalizată în lista permanentă
      localLines.current.push(currentLine.current);

      // Trimite evenimentul către server/alți useri
      onDrawLine({
        posterId: '',
        teamId: '',
        x1: startPoint.current.x,
        y1: startPoint.current.y,
        x2: x,
        y2: y,
        color: style.color,
        width: style.width,
      });

      // Resetează starea gestului curent
      currentLine.current = null;
      startPoint.current = null;
      forceRender();
    },
    [getDrawStyle, onDrawLine, forceRender],
  );

  return (
    <View style={styles.container}>
      {/* Camera în fundal — orientare portrait */}
      <CameraView style={styles.camera} facing="back" />

      {/* Canvas Skia transparent deasupra camerei */}
      <View
        style={styles.canvasWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Canvas style={styles.canvas}>
          {/* Desenează liniile primite de la ceilalți useri */}
          {remoteLines.map((evt, i) => (
            <Path
              key={`remote-${i}`}
              path={makePathFromEvent(evt)}
              color={evt.color}
              style="stroke"
              strokeWidth={evt.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}

          {/* Desenează liniile locale permanente */}
          {localLines.current.map((line, i) => (
            <Path
              key={`local-${i}`}
              path={line.path}
              color={line.color}
              style="stroke"
              strokeWidth={line.width}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}

          {/* Desenează linia curentă (în curs de desenare) */}
          {currentLine.current && (
            <Path
              path={currentLine.current.path}
              color={currentLine.current.color}
              style="stroke"
              strokeWidth={currentLine.current.width}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
        </Canvas>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  canvasWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  canvas: {
    flex: 1,
  },
});
