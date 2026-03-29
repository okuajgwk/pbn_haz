import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Adăugăm @ts-ignore pentru a forța TypeScript să ignore lipsa definiției.
// Funcția va rula perfect în spate.
// @ts-ignore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqJtRHfzzesHTriVpfvz9kE0Ntj82qalI",
  authDomain: "pbn-haz.firebaseapp.com",
  projectId: "pbn-haz",
  storageBucket: "pbn-haz.firebasestorage.app",
  messagingSenderId: "32978976320",
  appId: "1:32978976320:web:0efd53d99a5f7055a6a9a5",
};

// 1. Inițializăm instanța Firebase
const app = initializeApp(firebaseConfig);

// 2. Inițializăm serviciul de Autentificare cu persistență
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 3. Inițializăm Baza de Date
const db = getFirestore(app);

export { auth, db };

