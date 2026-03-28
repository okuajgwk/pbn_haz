// Importăm funcția principală care pornește aplicația Firebase
import { initializeApp } from 'firebase/app';

// Importăm modulele specifice de care vom avea nevoie
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- ÎNLOCUIEȘTE ACEST BLOC CU CODUL TĂU DE PE SITE ---
const firebaseConfig = {
  apiKey: "AIzaSyBqJtRHfzzesHTriVpfvz9kE0Ntj82qalI",
  authDomain: "pbn-haz.firebaseapp.com",
  projectId: "pbn-haz",
  storageBucket: "pbn-haz.firebasestorage.app",
  messagingSenderId: "32978976320",
  appId: "1:32978976320:web:0efd53d99a5f7055a6a9a5"
};
// ------------------------------------------------------

// 1. Inițializăm instanța Firebase cu cheile tale
const app = initializeApp(firebaseConfig);

// 2. Inițializăm serviciul de Autentificare
const auth = getAuth(app);

// 3. Inițializăm serviciul de Bază de Date (Firestore)
const db = getFirestore(app);

// 4. Exportăm variabilele pentru a le putea folosi în alte fișiere (ex: login.tsx)
export { auth, db };

