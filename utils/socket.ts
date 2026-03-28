import { io } from "socket.io-client";

// ATENȚIE: Dacă folosești un emulator Android, 'localhost' s-ar putea să nu meargă.
// În acel caz, înlocuiește 'localhost' cu '10.0.2.2' (IP-ul default pentru emulatorul Android).
// Dacă testezi pe un telefon fizic pe aceeași rețea WiFi, pune IP-ul local al PC-ului tău (ex: '192.168.1.100').
const SERVER_URL = "http://localhost:3001";

export const socket = io(SERVER_URL, {
  autoConnect: false, // Ne conectăm manual când avem nevoie
});
