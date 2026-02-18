
import { auth } from '../src/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    return {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      email: fbUser.email || '',
      isGuest: false
    };
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;
    // En Firebase Auth, para poner el nombre, se usa updateProfile, pero aquí simplificamos devolviendo el objeto
    return {
      id: fbUser.uid,
      name: name,
      email: fbUser.email || '',
      isGuest: false
    };
  },

  loginAsGuest: async (): Promise<User> => {
    const userCredential = await signInAnonymously(auth);
    const fbUser = userCredential.user;
    return {
      id: fbUser.uid,
      name: 'Invitado',
      email: '',
      isGuest: true
    };
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('user_session'); // Limpieza adicional si se usaba antes
    localStorage.removeItem('cart');
  },

  getCurrentUser: (): User | null => {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      id: user.uid,
      name: user.displayName || (user.isAnonymous ? 'Invitado' : user.email?.split('@')[0] || 'Usuario'),
      email: user.email || '',
      isGuest: user.isAnonymous
    };
  },

  // Helper para suscribirse a cambios de estado
  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        callback({
          id: fbUser.uid,
          name: fbUser.displayName || (fbUser.isAnonymous ? 'Invitado' : fbUser.email?.split('@')[0] || 'Usuario'),
          email: fbUser.email || '',
          isGuest: fbUser.isAnonymous
        });
      } else {
        callback(null);
      }
    });
  }
};
