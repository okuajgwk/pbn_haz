import cors from "cors";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

// === TIPURI ȘI INTERFEȚE ===
interface DrawEvent {
  posterId: string;
  teamId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

interface Poster {
  id: string;
  name: string;
  location: string;
}

// === CONFIGURARE ENGINE TERITORIU ===
const CELL_SIZE = 10; // Mărimea unei celule (10x10 pixeli). Cu cât e mai mică, cu atât e mai precis, dar consumă mai multă memorie.
const CANVAS_WIDTH = 400; // Lățimea virtuală a canvas-ului (ex: lățimea unui ecran de telefon)
const CANVAS_HEIGHT = 800; // Înălțimea virtuală
const TOTAL_CELLS =
  Math.ceil(CANVAS_WIDTH / CELL_SIZE) * Math.ceil(CANVAS_HEIGHT / CELL_SIZE);

// === STARE ÎN MEMORIE ===
// Liniile brute (pentru a le trimite clienților noi care se conectează)
const posterLines: Record<string, DrawEvent[]> = {};

// Grila de teritoriu. Cheia e posterId, valoarea e un Map unde:
// Key = "x,y" (coordonatele celulei), Value = "teamId"
const posterGrids: Record<string, Map<string, string>> = {};

// Funcție ajutătoare pentru a "ștanța" o linie pe grilă
function rasterizeLine(
  posterId: string,
  teamId: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
) {
  if (!posterGrids[posterId]) posterGrids[posterId] = new Map();
  const grid = posterGrids[posterId];

  // Calculăm distanța liniei
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Câți pași de interpolare facem pe linie ca să nu ratăm celule
  const steps = Math.max(Math.ceil(distance / (CELL_SIZE / 2)), 1);
  const radius = Math.floor(width / 2 / CELL_SIZE); // Grosimea afectează celulele vecine

  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = x1 + dx * t;
    const y = y1 + dy * t;

    // Coordonatele pe grilă
    const cellX = Math.floor(x / CELL_SIZE);
    const cellY = Math.floor(y / CELL_SIZE);

    // Marcăm celula centrală și vecinii (dacă linia e groasă)
    for (let rx = -radius; rx <= radius; rx++) {
      for (let ry = -radius; ry <= radius; ry++) {
        const targetX = cellX + rx;
        const targetY = cellY + ry;

        // Asigurăm-ne că nu ieșim din ecranul virtual
        if (
          targetX >= 0 &&
          targetX < CANVAS_WIDTH / CELL_SIZE &&
          targetY >= 0 &&
          targetY < CANVAS_HEIGHT / CELL_SIZE
        ) {
          grid.set(`${targetX},${targetY}`, teamId); // Suprascriem cu echipa curentă!
        }
      }
    }
  }
}

// === INIȚIALIZARE SERVER ===
const app = express();
app.use(cors({ origin: "*" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// === RUTE EXPRESS (REST API) ===
app.get("/posters", (req, res) => {
  res.json([
    { id: "poster-1", name: "Afișul A", location: "Hol intrare" },
    { id: "poster-2", name: "Afișul B", location: "Sala de conferințe" },
    { id: "poster-3", name: "Afișul C", location: "Cafeteria" },
  ]);
});

// === LOGICĂ SOCKET.IO ===
io.on("connection", (socket: Socket) => {
  console.log(`[+] Client conectat: ${socket.id}`);

  socket.on("join_poster", ({ posterId }: { posterId: string }) => {
    socket.join(posterId);
    if (!posterLines[posterId]) posterLines[posterId] = [];
    socket.emit("existing_lines", posterLines[posterId]);
  });

  socket.on("draw", (event: DrawEvent) => {
    if (!posterLines[event.posterId]) posterLines[event.posterId] = [];

    // 1. Salvăm linia pentru clienții viitori
    posterLines[event.posterId].push(event);

    // 2. Procesăm linia pe teritoriul invizibil
    rasterizeLine(
      event.posterId,
      event.teamId,
      event.x1,
      event.y1,
      event.x2,
      event.y2,
      event.width,
    );

    // 3. Trimitem mai departe celorlalți
    socket.to(event.posterId).emit("draw", event);
  });

  // NOUL ENGINE DE TERITORIU
  socket.on(
    "get_territory",
    (
      { posterId }: { posterId: string },
      callback: (data: Record<string, number>) => void,
    ) => {
      const grid = posterGrids[posterId];
      if (!grid) {
        if (callback) callback({});
        return;
      }

      const teamCounts: Record<string, number> = {};

      // Numărăm câte celule are fiecare echipă în Map
      for (const teamId of grid.values()) {
        teamCounts[teamId] = (teamCounts[teamId] || 0) + 1;
      }

      // Calculăm procentul din TOTALUL canvas-ului
      const territoryPercentages: Record<string, number> = {};
      for (const [teamId, count] of Object.entries(teamCounts)) {
        territoryPercentages[teamId] = Number(
          ((count / TOTAL_CELLS) * 100).toFixed(2),
        );
      }

      if (callback) callback(territoryPercentages);
      else socket.emit("territory_data", territoryPercentages);
    },
  );

  socket.on("clear_canvas", ({ posterId }: { posterId: string }) => {
    posterLines[posterId] = [];
    if (posterGrids[posterId]) posterGrids[posterId].clear(); // Curățăm și grila!
    io.to(posterId).emit("canvas_cleared");
  });

  socket.on("disconnect", () =>
    console.log(`[-] Client deconectat: ${socket.id}`),
  );
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(
    `🚀 Serverul iTEC: OVERRIDE (Engine v2) rulează pe http://localhost:${PORT}`,
  );
});
