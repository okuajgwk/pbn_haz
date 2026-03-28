import { User } from 'firebase/auth';
import { create } from 'zustand';

// Definim ce informații reține avizierul nostru
interface AuthState {
  user: User | null;      // Datele jucătorului (dacă e logat) sau null (dacă nu e)
  isLoading: boolean;     // Un indicator care ne spune dacă aplicația încă verifică jetonul
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}

// Creăm efectiv "memoria"
export const useAuthStore = create<AuthState>((set) => ({
  user: null,             // Presupunem că nu e logat la început
  isLoading: true,        // Începem prin a "încărca/verifica" starea
  
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));