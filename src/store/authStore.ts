import { reactive } from 'vue';

export type Role = 'user' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  currentUser: User | null;
  token: string | null;
}

const state = reactive<AuthState>({
  currentUser: null,
  token: null
});

const loadAuth = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  
  if (token && userJson) {
    try {
      state.token = token;
      state.currentUser = JSON.parse(userJson);
    } catch (e) {
      console.error('Failed to parse user from local storage');
    }
  }
};

loadAuth();

export const useAuthStore = () => {
  return {
    state,
    
    setAuth(user: User, token: string) {
      state.currentUser = user;
      state.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };
};
