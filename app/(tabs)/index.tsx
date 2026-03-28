import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GraffitiCanvas from "../../components/GraffitiCanvas";
import { socket } from "../../utils/socket";

export default function HomeScreen() {
  const [posters, setPosters] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedPosterId, setSelectedPosterId] = useState<string | null>(null);

  // Stări pentru testarea teritoriului
  const [myTeam, setMyTeam] = useState("Echipa_Roșie");
  const [myColor, setMyColor] = useState("#ff0055");
  const [territory, setTerritory] = useState<Record<string, number>>({});

  // Conexiunea inițială
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    fetch("http://localhost:3001/posters")
      .then((res) => res.json())
      .then((data) => setPosters(data))
      .catch((err) => console.error(err));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  // Cerem scorul în timp real când suntem într-un poster
  useEffect(() => {
    if (!selectedPosterId) return;

    // Întrebăm serverul care e situația teritoriului la fiecare secundă
    const interval = setInterval(() => {
      socket.emit(
        "get_territory",
        { posterId: selectedPosterId },
        (data: Record<string, number>) => {
          setTerritory(data);
        },
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedPosterId]);

  // Funcție de test pentru a schimba echipele rapid
  const toggleTeam = () => {
    if (myTeam === "Echipa_Roșie") {
      setMyTeam("Echipa_Albastră");
      setMyColor("#00ccff");
    } else {
      setMyTeam("Echipa_Roșie");
      setMyColor("#ff0055");
    }
  };

  // ECRANUL DE DESEN
  if (selectedPosterId) {
    const posterName = posters.find((p) => p.id === selectedPosterId)?.name;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="← Înapoi" onPress={() => setSelectedPosterId(null)} />
          <Text style={styles.title}>{posterName}</Text>
          <Button
            title="Curăță"
            color="#ff4444"
            onPress={() =>
              socket.emit("clear_canvas", { posterId: selectedPosterId })
            }
          />
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.teamBadge, { backgroundColor: myColor }]}
            onPress={toggleTeam}
          >
            <Text style={styles.badgeText}>Apasa sa schimbi: {myTeam}</Text>
          </TouchableOpacity>

          <View style={styles.territoryScores}>
            <Text style={{ color: "#ff0055", fontWeight: "bold" }}>
              Roșu: {territory["Echipa_Roșie"] || 0}%
            </Text>
            <Text style={{ color: "#00ccff", fontWeight: "bold" }}>
              Albastru: {territory["Echipa_Albastră"] || 0}%
            </Text>
          </View>
        </View>

        <View style={styles.canvasWrapper}>
          <GraffitiCanvas
            posterId={selectedPosterId}
            teamId={myTeam}
            color={myColor}
          />
        </View>
      </View>
    );
  }

  // ECRANUL PRINCIPAL (LISTA)
  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status: {isConnected ? "🟢 Conectat" : "🔴 Deconectat"}
      </Text>
      <Text style={styles.title}>Alege un afiș pentru a desena</Text>

      {posters.map((poster) => (
        <TouchableOpacity
          key={poster.id}
          style={styles.posterCard}
          onPress={() => setSelectedPosterId(poster.id)}
        >
          <Text style={styles.posterName}>{poster.name}</Text>
          <Text style={styles.posterLocation}>{poster.location}</Text>
        </TouchableOpacity>
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
  status: { color: "white", marginBottom: 20 },
  title: { color: "white", fontSize: 20, marginBottom: 15, fontWeight: "bold" },
  posterCard: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  posterName: { color: "#00ffcc", fontSize: 18, fontWeight: "bold" },
  posterLocation: { color: "#ccc", fontSize: 14, marginTop: 5 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  teamBadge: { padding: 8, borderRadius: 5 },
  badgeText: { color: "white", fontWeight: "bold" },
  territoryScores: { backgroundColor: "#222", padding: 8, borderRadius: 5 },
  canvasWrapper: { flex: 1, paddingBottom: 20 },
});
