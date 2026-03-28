import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();

// Permitem conexiuni de oriunde (esențial pentru testul pe Hotspot)
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Aici vom ține minte liniile desenate pentru fiecare afiș
const posterLines: Record<string, any[]> = {};

// --- RUTE EXPRESS (API HTTP) ---
app.get("/posters", (req, res) => {
  res.json([
    { id: "poster-1", name: "Afișul A", location: "Hol intrare" },
    { id: "poster-2", name: "Afișul B", location: "Sala de conferințe" },
    { id: "poster-3", name: "Afișul C", location: "Cafeteria" },
  ]);
});

// --- LOGICA DE TIMP REAL (SOCKET.IO) ---
io.on("connection", (socket: Socket) => {
  console.log(`[+] Client conectat: ${socket.id}`);

  // Când un utilizator dă click pe un afiș
  socket.on("join_poster", ({ posterId }) => {
    socket.join(posterId);
    console.log(`[ROOM] User ${socket.id} a intrat la ${posterId}`);

    // Dacă nu există istoric pentru acest afiș, creăm o listă goală
    if (!posterLines[posterId]) {
      posterLines[posterId] = [];
    }

    // Trimitem istoricul înapoi către telefonul care tocmai s-a conectat
    socket.emit("existing_lines", posterLines[posterId]);
  });

  // Când primim o linie desenată
  socket.on("draw", (lineData) => {
    const { posterId } = lineData;
    console.log(`[DRAW] Linie nouă pe ${posterId}`);

    // O salvăm în memoria serverului
    if (!posterLines[posterId]) posterLines[posterId] = [];
    posterLines[posterId].push(lineData);

    // O dăm mai departe către toți ceilalți din aceeași cameră (în afară de cel care a trimis-o)
    socket.to(posterId).emit("draw", lineData);
  });

  // Când cineva apasă butonul "Curăță"
  socket.on("clear_canvas", ({ posterId }) => {
    posterLines[posterId] = [];
    io.to(posterId).emit("canvas_cleared");
    console.log(`[CLEAR] Afișul ${posterId} a fost șters.`);
  });

  socket.on("disconnect", () => {
    console.log(`[-] Client deconectat: ${socket.id}`);
  });
});

// --- PORNIRE SERVER ---
const PORT = 3001;
// "0.0.0.0" este magic word-ul ca să accepte conexiuni de pe rețeaua locală (Wi-Fi/Hotspot)
server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Serverul (Versiunea de Bază) rulează pe http://0.0.0.0:${PORT}`,
  );
});
