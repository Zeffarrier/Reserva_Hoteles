import { apiClient } from './apiClient';
import type { Hotel, CreateHotelRequest, SuccessResponse } from '../types/models';

export const hotelService = {
  getHotels: () => {
    return apiClient.get<Hotel[]>('/hotels');
  },

  getHotel: (id: string) => {
    return apiClient.get<Hotel>(`/hotels/${id}`);
  },

  createHotel: (hotelData: CreateHotelRequest) => {
    return apiClient.post<SuccessResponse<Hotel>>('/hotels', hotelData);
  },

  updateHotel: (id: string, hotelData: any) => {
    return apiClient.put<SuccessResponse<Hotel>>(`/hotels/${id}`, hotelData);
  },

  deleteHotel: (id: string) => {
    return apiClient.delete<SuccessResponse<null>>(`/hotels/${id}`);
  }
};
