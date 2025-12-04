
interface User {
  id: string;
  name: string;
  email: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simular retraso de red
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulación muy básica: Acepta cualquier correo con formato válido y password > 3 chars
        // En un backend real, aquí se verificaría contra la base de datos hash
        if (password.length < 4) {
          reject(new Error("La contraseña es incorrecta."));
          return;
        }

        const mockUser: User = {
          id: 'user-123',
          name: email.split('@')[0], // Usar parte del correo como nombre si no existe
          email: email
        };
        
        // Guardar sesión simulada
        localStorage.setItem('user_session', JSON.stringify(mockUser));
        resolve(mockUser);
      }, 1000);
    });
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email
        };
        localStorage.setItem('user_session', JSON.stringify(newUser));
        resolve(newUser);
      }, 1500);
    });
  },

  logout: () => {
    localStorage.removeItem('user_session');
    // También limpiamos el carrito al salir por seguridad en esta demo
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem('user_session');
    return session ? JSON.parse(session) : null;
  }
};
