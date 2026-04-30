import type { User, Role } from '../store/authStore';
import { apiClient } from './apiClient';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface ProfileResponse {
  id: string;
  email: string;
  display_name: string;
  user_type: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const loginRes = await apiClient.post<LoginResponse>('/users/login', { email, password });
    localStorage.setItem('token', loginRes.access_token);
    const profileData = await apiClient.get<ProfileResponse>('/users/profile');
    return {
      token: loginRes.access_token,
      user: {
        id: profileData.id,
        name: profileData.display_name,
        email: profileData.email,
        role: profileData.user_type as Role,
      },
    };
  },

  async register(name: string, email: string, password: string, role: Role = 'user'): Promise<void> {
    await apiClient.post<null>('/users/register', { 
      display_name: name, 
      email, 
      password,
      user_type: role
    });
  },

  async getProfile(): Promise<{ user: User }> {
    const profileData = await apiClient.get<ProfileResponse>('/users/profile');
    return {
      user: {
        id: profileData.id,
        name: profileData.display_name,
        email: profileData.email,
        role: profileData.user_type as Role,
      },
    };
  },

  async updateProfile(id: string, payload: { name: string; email: string; password?: string }): Promise<{ user: User }> {
    return await apiClient.put<{ user: User }>(`/users/${id}`, payload);
  },
};
