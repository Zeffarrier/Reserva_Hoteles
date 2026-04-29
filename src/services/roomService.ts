import { apiClient } from './apiClient';
import type { Room, CreateRoomRequest, SuccessResponse } from '../types/models';

export const roomService = {
  getRoomsByHotel: (hotelId: string) => {
    return apiClient.get<Room[]>(`/rooms?hotel_id=${hotelId}`);
  },

  getRoom: (id: string) => {
    return apiClient.get<Room>(`/rooms/${id}`);
  },

  createRoom: (roomData: CreateRoomRequest) => {
    return apiClient.post<SuccessResponse<Room>>('/rooms', roomData);
  },

  updateRoom: (id: string, roomData: any) => {
    return apiClient.put<SuccessResponse<Room>>(`/rooms/${id}`, roomData);
  },

  deleteRoom: (id: string) => {
    return apiClient.delete<SuccessResponse<null>>(`/rooms/${id}`);
  }
};
