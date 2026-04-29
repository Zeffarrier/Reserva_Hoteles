// TypeScript interfaces matching the Go models in the BFF (BackendForFrontend)

export interface Hotel {
  id: string;
  admin_id?: string;
  name: string;
  city: string;
  description: string;
  rating: number;
  lat: number;
  lng: number;
  created_at: string;
  updated_at: string;
}

export interface HighlightedAmenity {
  id?: string;
  room_id?: string;
  icon: string;
  text: string;
  created_at?: string;
  updated_at?: string;
}

export interface AmenityCategory {
  id?: string;
  room_id?: string;
  name: string;
  description: string;
  tier: string;
  amenity_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  space_info: string;
  bed_distribution: string;
  quantity: number;
  amenity_count: number;
  recommendation_coef: number;
  highlighted_amenities: HighlightedAmenity[];
  amenity_categories: AmenityCategory[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  hotel_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  guest_count: number;
  total_price: number;
  status: string; // "pending", "confirmed", "cancelled", "completed"
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingDetails {
  reservation: Booking;
  hotel: Hotel;
  room: Room;
}

export interface HotelWithRooms {
  hotel: Hotel;
  rooms: Room[];
}

export interface CreateHotelRequest {
  name: string;
  city: string;
  description?: string;
  lat?: number;
  lng?: number;
}

export interface CreateRoomRequest {
  hotel_id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  space_info: string;
  bed_distribution: string;
  quantity: number;
  highlighted_amenities?: HighlightedAmenity[];
  amenity_categories?: AmenityCategory[];
}

export interface CreateBookingRequest {
  hotel_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  guest_count: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  payment_method_id: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

export interface SuccessResponse<T = any> {
  message: string;
  data?: T;
}

export interface HealthResponse {
  status: string;
  hotels_service: string;
  rooms_service: string;
  bookings_service: string;
  timestamp: string;
}
