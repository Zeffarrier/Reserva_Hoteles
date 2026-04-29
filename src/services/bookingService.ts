import { apiClient } from './apiClient';
import type { Booking, BookingDetails, CreateBookingRequest, SuccessResponse } from '../types/models';

export const bookingService = {
  createBooking: (bookingData: CreateBookingRequest) => {
    // The BFF might use /reservations or /bookings depending on configuration, 
    // but the Go models refer to Reservations in composite types. 
    // Adjusting to /bookings as defined in API Gateway path_prefix, 
    // though BFF routes might dictate otherwise.
    return apiClient.post<SuccessResponse<Booking>>('/bookings', bookingData);
  },

  getBookingDetails: (id: string) => {
    return apiClient.get<BookingDetails>(`/reservations/${id}/details`);
  },

  getUserBookings: (userId: string) => {
    return apiClient.get<Booking[]>(`/users/${userId}/bookings`);
  },

  getAllBookings: () => {
    return apiClient.get<Booking[]>('/bookings');
  },

  updateBookingStatus: (id: string, status: string) => {
    return apiClient.put<SuccessResponse<Booking>>(`/bookings/${id}/status`, { status });
  }
};
