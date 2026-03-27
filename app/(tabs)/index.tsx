import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { socket } from "../../utils/socket"; // Ajustează calea dacă e nevoie

export default function HomeScreen() {
  const [posters, setPosters] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Ne conectăm la Socket.io
    socket.connect();

    socket.on("connect", () => {
      console.log("Conectat la serverul Socket.io!");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Deconectat de la server.");
      setIsConnected(false);
    });

    // 2. Cerem lista de afișe de la REST API
    fetch("http://localhost:3001/posters") // Schimbă localhost cu 10.0.2.2 pt emulator Android
      .then((res) => res.json())
      .then((data) => {
        console.log("Afișe primite:", data);
        setPosters(data);
      })
      .catch((err) => console.error("Eroare la fetch afișe:", err));

    // Curățăm conexiunea la demontarea componentei
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status Server: {isConnected ? "🟢 Conectat" : "🔴 Deconectat"}
      </Text>

      <Text style={styles.title}>Afișe iTEC: OVERRIDE</Text>

      {posters.map((poster) => (
        <View key={poster.id} style={styles.posterCard}>
          <Text style={styles.posterName}>{poster.name}</Text>
          <Text style={styles.posterLocation}>Locație: {poster.location}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#121212",
  },
  status: {
    color: "white",
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  title: { color: "white", fontSize: 24, marginBottom: 15 },
  posterCard: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  posterName: { color: "#00ffcc", fontSize: 18, fontWeight: "bold" },
  posterLocation: { color: "#ccc", fontSize: 14, marginTop: 5 },
});
