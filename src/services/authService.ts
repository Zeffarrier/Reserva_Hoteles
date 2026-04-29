import type { User } from '../store/authStore';
import { apiClient } from './apiClient';

export const authService = {
  async login(email: string, password: string):Promise<{ token: string, user: User }> {
    return await apiClient.post<{ token: string, user: User }>('/users/login', { email, password });
  },

  async register(name: string, email: string, password: string):Promise<{ token: string, user: User }> {
    return await apiClient.post<{ token: string, user: User }>('/users/register', { name, email, password });
  },

  async getProfile():Promise<{ user: User }> {
    return await apiClient.get<{ user: User }>('/users/profile');
  },

  async updateProfile(id: string, payload: { name: string, email: string, password?: string }):Promise<{ user: User }> {
    return await apiClient.put<{ user: User }>(`/users/${id}`, payload);
  }
};
