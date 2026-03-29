import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Image,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
// Importuri Firebase
import {
    arrayUnion,
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLORS = [
  "#ff00ff",
  "#00ffff",
  "#ffff00",
  "#ff0000",
  "#00ff00",
  "#ffffff",
  "#ff6600",
];
const STICKERS = ["🔥", "⚡", "💀", "👑", "🎨", "💥", "🌀"];

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
  const { posterId } = useLocalSearchParams<{ posterId: string }>();
  const activePosterId = posterId || "afis_1";

  const [paths, setPaths] = useState<PathData[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ff00ff");
  const [brushSize, setBrushSize] = useState(4);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [tool, setTool] = useState<"brush" | "eraser" | "sticker">("brush");

  // NOU: Referință sincronă pentru linia desenată (elimină eroarea cu "L")
  const pathRef = useRef("");

  const stateRef = useRef({
    tool: "brush",
    selectedColor: "#ff00ff",
    brushSize: 4,
    selectedSticker: null as string | null,
  });

  useEffect(() => {
    stateRef.current = {
      tool,
      selectedColor,
      brushSize,
      selectedSticker,
    };
  }, [tool, selectedColor, brushSize, selectedSticker]);

  // SINCRONIZARE REAL-TIME CU FIRESTORE
  // SINCRONIZARE REAL-TIME CU FIRESTORE (CU FILTRU ANTI-CRASH)
  useEffect(() => {
    const docRef = doc(db, "posters", activePosterId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        // FILTRUL MAGIC: Păstrăm doar liniile care sunt valide (încep cu 'M')
        const rawPaths = data.paths || [];
        const safePaths = rawPaths.filter(
          (p: PathData) => p.d && p.d.trim().startsWith("M"),
        );

        setPaths(safePaths);
        setStickers(data.stickers || []);
      } else {
        setDoc(docRef, { paths: [], stickers: [] });
      }
    });

    return () => unsubscribe();
  }, [activePosterId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: async (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const { tool, selectedSticker } = stateRef.current;

        if (tool === "sticker" && selectedSticker) {
          const newSticker = {
            emoji: selectedSticker,
            x: locationX - 20,
            y: locationY - 20,
          };

          const docRef = doc(db, "posters", activePosterId);
          await updateDoc(docRef, {
            stickers: arrayUnion(newSticker),
          });
          return;
        }

        // Salvăm M-ul inițial instantaneu în ref
        pathRef.current = `M${locationX},${locationY}`;
        setCurrentPath(pathRef.current);
      },
      onPanResponderMove: (e) => {
        // Folosim stateRef.current.tool pentru a evita stale closures
        if (stateRef.current.tool === "sticker") return;
        const { locationX, locationY } = e.nativeEvent;

        // Construim calea direct în ref, în siguranță
        if (!pathRef.current || !pathRef.current.startsWith("M")) {
          pathRef.current = `M${locationX},${locationY}`;
        } else {
          pathRef.current += ` L${locationX},${locationY}`;
        }

        setCurrentPath(pathRef.current);
      },
      onPanResponderRelease: async () => {
        const { tool, selectedColor, brushSize } = stateRef.current;

        if (tool === "sticker") return;

        // Verificăm dacă avem o linie validă în ref
        if (pathRef.current) {
          const newPath = {
            d: pathRef.current,
            color: tool === "eraser" ? "#0a0a0a" : selectedColor,
            width: tool === "eraser" ? 20 : brushSize,
          };

          const docRef = doc(db, "posters", activePosterId);
          await updateDoc(docRef, {
            paths: arrayUnion(newPath),
          });

          // Curățăm ref-ul și state-ul
          pathRef.current = "";
          setCurrentPath("");
        }
      },
    }),
  ).current;

  const clearCanvasInCloud = async () => {
    const docRef = doc(db, "posters", activePosterId);
    await setDoc(docRef, { paths: [], stickers: [] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasArea} {...panResponder.panHandlers}>
        <Image
          source={require("../assets/images/afis1.png")}
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
              stroke={tool === "eraser" ? "#0a0a0a" : selectedColor}
              strokeWidth={tool === "eraser" ? 20 : brushSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
        {stickers.map((s, i) => (
          <Text
            key={i}
            style={[styles.stickerOnCanvas, { left: s.x, top: s.y }]}
          >
            {s.emoji}
          </Text>
        ))}
      </View>

      <View style={styles.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => {
                setSelectedColor(color);
                setTool("brush");
              }}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                selectedColor === color &&
                  tool === "brush" &&
                  styles.selectedDot,
              ]}
            />
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setTool("brush")}
            style={[styles.toolBtn, tool === "brush" && styles.activeTool]}
          >
            <Text style={styles.toolText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTool("eraser")}
            style={[styles.toolBtn, tool === "eraser" && styles.activeTool]}
          >
            <Text style={styles.toolText}>🧹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearCanvasInCloud} style={styles.toolBtn}>
            <Text style={styles.toolText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (tool === "sticker") {
                setStickers((prev) => prev.slice(0, -1));
              } else {
                setPaths((prev) => prev.slice(0, -1));
              }
            }}
            style={styles.toolBtn}
          >
            <Text style={styles.toolText}>↩️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.toolBtn}
          >
            <Text style={styles.toolText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {tool === "brush" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            {[2, 4, 8, 16].map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setBrushSize(size)}
                style={[
                  styles.toolBtn,
                  brushSize === size && styles.activeTool,
                ]}
              >
                <View
                  style={{
                    width: size * 2,
                    height: size * 2,
                    borderRadius: size,
                    backgroundColor: selectedColor,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STICKERS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => {
                setSelectedSticker(emoji);
                setTool("sticker");
              }}
              style={[
                styles.toolBtn,
                selectedSticker === emoji &&
                  tool === "sticker" &&
                  styles.activeTool,
              ]}
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
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  canvasArea: { flex: 1 },
  posterImage: { width: "100%", height: "100%" },
  toolbar: {
    backgroundColor: "#111",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedDot: { borderColor: "white", transform: [{ scale: 1.2 }] },
  toolBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTool: { backgroundColor: "#444", borderWidth: 1, borderColor: "#fff" },
  toolText: { color: "white", fontSize: 16 },
  stickerOnCanvas: {
    position: "absolute",
    fontSize: 40,
  },
});
