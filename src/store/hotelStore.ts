import { reactive, watch } from 'vue'

export type Role = 'client' | 'receptionist' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: Role
}

export interface Hotel {
  id: string
  name: string
  city: string
  description: string
  image: string
  rating: number
  lat: number
  lng: number
}

export interface RoomExtendedDetails {
  spaceInfo: string;
  roomBreakdown: { name: string; beds: string }[];
  highlightAmenities: { icon: string; text: string }[];
  categorizedAmenities: Record<string, string[]>;
}

export interface Room {
  id: string
  hotelId: string
  name: string
  type: 'Single' | 'Double' | 'Double/Double' | 'Suite'
  pricePerNight: number
  capacity: number
  image: string
  images?: string[]
  amenities?: string[]
  description: string
  isAvailable: boolean
  extendedDetails?: RoomExtendedDetails
}

export interface Reservation {
  id: string
  roomId: string
  clientId?: string
  clientName: string
  clientEmail: string
  clientPhone: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: 'Pending' | 'Confirmed' | 'Cancelled'
}

interface State {
  hotels: Hotel[]
  rooms: Room[]
  reservations: Reservation[]
  users: User[]
  currentUser: User | null
}

const defaultState: State = {
  currentUser: null,
  users: [
    { id: 'u1', name: 'Admin User', email: 'admin@hotel.com', password: '123', role: 'admin' },
    { id: 'u2', name: 'Receptionist', email: 'recep@hotel.com', password: '123', role: 'receptionist' },
    { id: 'u3', name: 'Juan Cliente', email: 'juan@example.com', password: '123', role: 'client' }
  ],
  hotels: [
    {
      id: 'h1',
      name: 'AC Hotel Panama City',
      city: 'Panamá',
      description: 'Experimenta la elegancia y el diseño moderno en el corazón del distrito financiero. Cuenta con una espectacular piscina en la azotea, gimnasio de última generación y vistas inigualables.',
      image: '/images/media__1776790094302.png',
      rating: 4.8,
      lat: 8.9824,
      lng: -79.5209
    },
    {
      id: 'h2',
      name: 'Hotel Riu Plaza Panama',
      city: 'Panamá',
      description: 'Disfruta de un servicio de primera clase y una ubicación privilegiada en el corazón de la ciudad. Instalaciones modernas, restaurantes de clase mundial y vistas increíbles.',
      image: '/images/riu_exterior.png',
      rating: 4.6,
      lat: 8.9833,
      lng: -79.5167
    },
    {
      id: 'h3',
      name: 'Gamma Rincón de Santiago',
      city: 'Santiago',
      description: 'Descubre la tranquilidad y belleza de Santiago desde nuestro encantador resort. Disfruta de la naturaleza, arquitectura acogedora y las mejores piscinas de la región.',
      image: '/images/gamma_exterior.jpg',
      rating: 4.5,
      lat: 8.0964,
      lng: -80.9686
    }
  ],
  rooms: [
    {
      id: '1', hotelId: 'h1', name: 'Habitación King Estándar', type: 'Double', pricePerNight: 120, capacity: 2,
      image: '/images/media__1776790094242.png',
      images: [
        '/images/media__1776790094242.png',
        '/images/media__1776790660628.png',
        '/images/media__1776790660646.png'
      ],
      amenities: ['Wi-Fi Gratis', 'Aire Acondicionado', 'TV Plana', 'Mini Bar'],
      description: 'Acogedora habitación de diseño moderno con cama King, ideal para descansar después de un día en la ciudad.', isAvailable: true,
      extendedDetails: {
        spaceInfo: '1 habitación, 2 personas • 350 pies cuadrados',
        roomBreakdown: [{ name: 'Habitación 1', beds: '1 cama King' }],
        highlightAmenities: [
          { icon: 'bed', text: 'Ropa de cama premium' },
          { icon: 'snowflake', text: 'Aire acondicionado' },
          { icon: 'tv', text: 'TV de pantalla plana' }
        ],
        categorizedAmenities: {
          'Baño': ['Baño privado', 'Amenidades de baño gratuitas', 'Regadera', 'Secadora de cabello', 'Toallas'],
          'Entretenimiento': ['TV de pantalla plana con canales de cable'],
          'Habitación': ['Aire acondicionado', 'Cortinas blackout', 'Ropa de cama de alta calidad'],
          'Internet': ['Wifi gratis']
        }
      }
    },
    {
      id: '2', hotelId: 'h1', name: 'Habitación Doble', type: 'Double/Double', pricePerNight: 135, capacity: 4,
      image: '/images/media__1776790094270.png',
      images: [
        '/images/media__1776790094270.png',
        '/images/media__1776791477134.png',
        '/images/media__1776791477261.png'
      ],
      amenities: ['Wi-Fi Gratis', 'Aire Acondicionado', 'TV Plana', 'Cafetera'],
      description: 'Amplia habitación con dos camas matrimoniales, perfecta para familias o grupos pequeños.', isAvailable: true,
      extendedDetails: {
        spaceInfo: '1 habitación, 4 personas • 450 pies cuadrados',
        roomBreakdown: [{ name: 'Habitación 1', beds: '2 camas matrimoniales' }],
        highlightAmenities: [
          { icon: 'bed', text: 'Ropa de cama premium' },
          { icon: 'snowflake', text: 'Aire acondicionado' },
          { icon: 'coffee', text: 'Cafetera/tetera' }
        ],
        categorizedAmenities: {
          'Baño': ['Baño privado', 'Amenidades de baño gratuitas', 'Regadera', 'Secadora de cabello', 'Toallas'],
          'Entretenimiento': ['TV de pantalla plana con canales de cable'],
          'Habitación': ['Aire acondicionado', 'Cortinas blackout', 'Ropa de cama de alta calidad'],
          'Alimentos y bebidas': ['Cafetera', 'Agua embotellada gratuita'],
          'Internet': ['Wifi gratis']
        }
      }
    },
    {
      id: '3', hotelId: 'h1', name: 'Suite Panorámica con Piscina', type: 'Suite', pricePerNight: 280, capacity: 2,
      image: '/images/media__1776790094375.png',
      images: [
        '/images/media__1776790094375.png',
        '/images/media__1776791690686.png',
        '/images/media__1776791690811.png',
        '/images/media__1776791690552.png'
      ],
      amenities: ['Wi-Fi Gratis', 'Vista Panorámica', 'Acceso a Piscina', 'Room Service 24/7'],
      description: 'Lujosa suite que incluye acceso prioritario a la piscina de la azotea y vistas completas a la ciudad de Panamá.', isAvailable: true,
      extendedDetails: {
        spaceInfo: '2 habitaciones, 5 personas • 969 pies cuadrados',
        roomBreakdown: [
          { name: 'Habitación 1', beds: '1 cama King' },
          { name: 'Habitación 2', beds: '1 cama King' },
          { name: 'Sala de estar', beds: '1 sofá cama individual' }
        ],
        highlightAmenities: [
          { icon: 'sofa', text: 'Área de descanso separada' },
          { icon: 'utensils', text: 'Área de comedor independiente' },
          { icon: 'headphones', text: 'Habitaciones insonorizadas' },
          { icon: 'sparkle', text: 'Decoración personalizada' },
          { icon: 'snowflake', text: 'Aire acondicionado' }
        ],
        categorizedAmenities: {
          'Acceso para personas con discapacidad': ['Acceso para silla de ruedas', 'Piso de baldosas', 'Piso de madera sólida'],
          'Habitación': ['2 habitaciones', 'Aire acondicionado', 'Cortinas blackout', 'Ropa de cama de alta calidad', 'Habitaciones insonorizadas'],
          'Baño': ['2 baños privados', 'Amenidades de baño gratuitas', 'Regadera', 'Secadora de cabello', 'Shampoo', 'Toallas'],
          'Entretenimiento': ['TV de pantalla plana con canales de cable'],
          'Alimentos y bebidas': ['Cocina', 'Comedor', 'Refrigerador', 'Microondas', 'Cafetera', 'Vajilla/utensilios'],
          'Internet': ['Wifi gratis'],
          'Más': ['Área de descanso', 'Con vista a la ciudad', 'Espacio para trabajar con laptop']
        }
      }
    },
    {
      id: '4', hotelId: 'h2', name: 'Habitación de lujo, cama King', type: 'Double', pricePerNight: 165, capacity: 2,
      image: '/images/riu_img1.png',
      images: [
        '/images/riu_img1.png',
        '/images/riu_img2.jpg',
        '/images/riu_img3.jpg',
        '/images/riu_img4.jpg'
      ],
      amenities: ['Wi-Fi Gratis', 'Aire Acondicionado', 'TV Plana', 'Mini Bar', 'Mesa de trabajo'],
      description: 'Elegante y moderna habitación equipada con todas las comodidades para una estancia de lujo inolvidable.', isAvailable: true,
      extendedDetails: {
        spaceInfo: '1 habitación, 2 personas • 400 pies cuadrados',
        roomBreakdown: [{ name: 'Habitación Principal', beds: '1 cama King' }],
        highlightAmenities: [
          { icon: 'bed', text: 'Ropa de cama premium' },
          { icon: 'snowflake', text: 'Aire acondicionado central' },
          { icon: 'tv', text: 'TV de pantalla plana' },
          { icon: 'briefcase', text: 'Espacio para trabajar con laptop' }
        ],
        categorizedAmenities: {
          'Baño': ['Baño privado de lujo', 'Amenidades de baño gratuitas', 'Regadera', 'Secadora de cabello', 'Espejo de vanidad'],
          'Entretenimiento': ['TV de pantalla plana con canales premium'],
          'Habitación': ['Aire acondicionado', 'Cortinas blackout', 'Ropa de cama de alta calidad', 'Insonorización'],
          'Internet': ['Wifi gratis de alta velocidad'],
          'Más': ['Mesa de trabajo', 'Mini bar', 'Caja de seguridad']
        }
      }
    },
    {
      id: '5', hotelId: 'h3', name: 'Habitación Deluxe, 2 camas matrimoniales', type: 'Double/Double', pricePerNight: 110, capacity: 4,
      image: '/images/gamma_room_1.jpg',
      images: [
        '/images/gamma_room_1.jpg',
        '/images/gamma_room_2.jpg',
        '/images/gamma_room_3.jpg'
      ],
      amenities: ['Wi-Fi Gratis', 'Aire Acondicionado', 'TV Plana', 'Vista panorámica'],
      description: 'Amplia y confortable habitación con diseño rústico-contemporáneo. Ideal para familias que buscan disfrutar de la tranquilidad.', isAvailable: true,
      extendedDetails: {
        spaceInfo: '1 habitación, 4 personas • 380 pies cuadrados',
        roomBreakdown: [{ name: 'Habitación Principal', beds: '2 camas matrimoniales' }],
        highlightAmenities: [
          { icon: 'bed', text: 'Ropa de cama de alta calidad' },
          { icon: 'mountain', text: 'Excelente vista' },
          { icon: 'tv', text: 'TV de pantalla plana' },
          { icon: 'snowflake', text: 'Aire acondicionado' }
        ],
        categorizedAmenities: {
          'Baño': ['Baño privado', 'Amenidades de baño gratuitas', 'Espejo de aumento luminoso', 'Regadera'],
          'Entretenimiento': ['TV de pantalla plana'],
          'Habitación': ['Aire acondicionado', 'Cortinas blackout', 'Diseño rústico elegante'],
          'Internet': ['Wifi gratis']
        }
      }
    }
  ],
  reservations: []
}

// Ensure smooth migration from old state by merging default hotels if missing
const loadState = (): State => {
  const saved = localStorage.getItem('hotel_store_state_v10')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (!parsed.hotels) {
        parsed.hotels = defaultState.hotels
      }
      // fix rooms if they don't have hotelId and migrate legacy icons
      parsed.rooms = parsed.rooms.map((r: any) => {
        // Fix legacy emojis and incorrect info icons in highlightAmenities
        if (r.extendedDetails?.highlightAmenities) {
          const emojiMap: Record<string, string> = {
            '🛏️': 'bed', '❄️': 'snowflake', '☕': 'coffee', '📺': 'tv',
            '🛋️': 'sofa', '🍽️': 'utensils', '🎧': 'headphones', '✨': 'sparkle',
            '💼': 'briefcase', '🏔️': 'mountain', '🔒': 'lock'
          }
          r.extendedDetails.highlightAmenities = r.extendedDetails.highlightAmenities.map((ha: any) => {
            if (emojiMap[ha.icon]) {
              ha.icon = emojiMap[ha.icon]
            } else if (ha.icon === 'info' || !ha.icon || !['location', 'calendar', 'user', 'users', 'star', 'close', 'arrow-left', 'chevron-left', 'chevron-right', 'hotel', 'money', 'building', 'city', 'bed', 'search', 'snowflake', 'tv', 'coffee', 'sofa', 'utensils', 'headphones', 'sparkle', 'briefcase', 'mountain', 'credit-card', 'lock', 'info', 'edit'].includes(ha.icon)) {
               // Auto-recover based on text if it defaulted to info or is unknown
               const t = (ha.text || '').toLowerCase()
               if (t.includes('cama')) ha.icon = 'bed'
               else if (t.includes('aire')) ha.icon = 'snowflake'
               else if (t.includes('tv') || t.includes('pantalla')) ha.icon = 'tv'
               else if (t.includes('cafe')) ha.icon = 'coffee'
               else if (t.includes('vista') || t.includes('montaña')) ha.icon = 'mountain'
               else if (t.includes('trabajo') || t.includes('laptop')) ha.icon = 'briefcase'
               else if (!ha.icon || ha.icon === 'info') ha.icon = 'info' 
               else ha.icon = 'info' // fallback to info if unknown and not matched
            }
            return ha
          })
        }
        
        return {
          ...r,
          hotelId: r.hotelId || 'h1'
        }
      })

      // Fix any hotels that have coordinates outside Panama bounds
      parsed.hotels = parsed.hotels.map((h: any) => {
        if (h.lat > 9.7 || h.lat < 7.0 || h.lng > -77.1 || h.lng < -83.1) {
          // Relocate them safely inside Panama (e.g. Santiago, Veraguas)
          return { ...h, lat: 8.0964, lng: -80.9686 }
        }
        return h
      })

      return parsed
    } catch (e) {
      console.error('Error parsing localStorage state')
    }
  }
  return defaultState
}

const state = reactive<State>(loadState())

watch(() => state, (newState) => {
  localStorage.setItem('hotel_store_state_v10', JSON.stringify(newState))
}, { deep: true })

// Session-only search dates (not persisted)
const searchDates = reactive<{ start: Date | null, end: Date | null }>({ start: null, end: null })

export const useHotelStore = () => {
  return {
    state,
    searchDates,

    // Hotel Actions
    addHotel(hotel: Omit<Hotel, 'id'>) {
      const id = `H-${Math.floor(Math.random() * 10000)}`
      state.hotels.push({ ...hotel, id })
      return id
    },

    updateHotel(id: string, updates: Partial<Omit<Hotel, 'id'>>) {
      const index = state.hotels.findIndex(h => h.id === id)
      if (index !== -1) {
        state.hotels[index] = { ...state.hotels[index], ...updates }
        return true
      }
      return false
    },

    deleteHotel(hotelId: string) {
      const index = state.hotels.findIndex(h => h.id === hotelId)
      if (index !== -1) {
        state.hotels.splice(index, 1)
        state.rooms = state.rooms.filter(r => r.hotelId !== hotelId)
        state.reservations = state.reservations.filter(r => r.hotelId !== hotelId)
        return true
      }
      return false
    },

    addRoom(room: Omit<Room, 'id'>) {
      const id = `${Math.floor(Math.random() * 100000)}`
      state.rooms.push({ ...room, id })
      return id
    },

    deleteRoom(roomId: string) {
      const index = state.rooms.findIndex(r => r.id === roomId)
      if (index !== -1) {
        state.rooms.splice(index, 1)
        return true
      }
      return false
    },

    updateRoom(id: string, updates: Partial<Omit<Room, 'id' | 'hotelId'>>) {
      const index = state.rooms.findIndex(r => r.id === id)
      if (index !== -1) {
        state.rooms[index] = { ...state.rooms[index], ...updates }
        return true
      }
      return false
    },

    getHotelsByCity(city: string) {
      if (!city.trim()) return state.hotels
      const lowerCity = city.toLowerCase()
      return state.hotels.filter(h => h.city.toLowerCase().includes(lowerCity))
    },

    getRoomsForHotel(hotelId: string) {
      return state.rooms.filter(r => r.hotelId === hotelId)
    },

    // Reservation Actions
    addReservation(reservation: Omit<Reservation, 'id'>) {
      const id = `RES-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

      if (state.currentUser && state.currentUser.role === 'client') {
        reservation.clientId = state.currentUser.id
        reservation.clientName = state.currentUser.name
        reservation.clientEmail = state.currentUser.email
      }

      state.reservations.push({ ...reservation, id })

      const room = state.rooms.find(r => r.id === reservation.roomId)
      if (room) room.isAvailable = false
      return id
    },

    cancelReservation(id: string) {
      const index = state.reservations.findIndex(r => r.id === id)
      if (index !== -1) {
        const res = state.reservations[index]
        res.status = 'Cancelled'

        const room = state.rooms.find(r => r.id === res.roomId)
        if (room) room.isAvailable = true
      }
    },

    confirmReservation(id: string) {
      const res = state.reservations.find(r => r.id === id)
      if (res) res.status = 'Confirmed'
    },

    updateReservation(id: string, updates: Partial<Omit<Reservation, 'id'>>) {
      const index = state.reservations.findIndex(r => r.id === id)
      if (index !== -1) {
        state.reservations[index] = { ...state.reservations[index], ...updates }
        return true
      }
      return false
    },

    // User Actions
    login(email: string, password?: string) {
      const user = state.users.find(u => u.email === email && u.password === password)
      if (user) {
        state.currentUser = user
        return true
      }
      return false
    },

    logout() {
      state.currentUser = null
    },

    registerUser(user: Omit<User, 'id' | 'role'>) {
      if (state.users.some(u => u.email === user.email)) return false
      const id = `U-${Math.floor(Math.random() * 10000)}`
      const newUser: User = { ...user, id, role: 'client' }
      state.users.push(newUser)
      state.currentUser = newUser
      return true
    },

    updateProfile(data: { name: string, email: string, password?: string }) {
      if (!state.currentUser) return false

      if (state.users.some(u => u.email === data.email && u.id !== state.currentUser?.id)) {
        return false
      }

      const userIndex = state.users.findIndex(u => u.id === state.currentUser?.id)
      if (userIndex !== -1) {
        state.users[userIndex].name = data.name
        state.users[userIndex].email = data.email
        if (data.password) state.users[userIndex].password = data.password

        state.currentUser.name = data.name
        state.currentUser.email = data.email
        return true
      }
      return false
    }
  }
}
