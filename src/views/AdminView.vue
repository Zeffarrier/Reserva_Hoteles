<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useHotelStore, type Hotel, type Room, type RoomExtendedDetails, type Reservation } from '../store/hotelStore'
import ReservationList from '../components/ReservationList.vue'
import SvgIcon from '../components/SvgIcon.vue'
import LocationPickerMap from '../components/LocationPickerMap.vue'

const { state, addHotel, updateHotel, deleteHotel, addRoom, deleteRoom, updateRoom, cancelReservation, confirmReservation, updateReservation } = useHotelStore()

const currentTab = ref<'dashboard' | 'hotels' | 'reservations'>('dashboard')

watch(currentTab, () => {
  showHotelForm.value = false
  showHotelDetails.value = false
  selectedHotel.value = null
  showRoomForm.value = false
  isEditingRoom.value = false
  editingRoomId.value = null
  showEditReservation.value = false
  editingResId.value = null
})

// Dashboard stats
const totalRooms = computed(() => state.rooms.length)
const occupiedRooms = computed(() => state.rooms.filter(r => !r.isAvailable).length)
const occupancyRate = computed(() => {
  if (totalRooms.value === 0) return 0
  return Math.round((occupiedRooms.value / totalRooms.value) * 100)
})

const totalRevenue = computed(() => {
  return state.reservations
    .filter(r => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + r.totalPrice, 0)
})

// Hotel Management
const isEditing = ref(false)
const showHotelForm = ref(false)
const editingHotelId = ref<string | null>(null)

const hotelForm = ref({
  name: '',
  city: '',
  description: '',
  image: '',
  rating: 5,
  lat: 8.9824,
  lng: -79.5209
})

const hotelFormError = ref('')

const validateHotelForm = () => {
  if (!hotelForm.value.name.trim()) return 'El nombre del hotel es obligatorio.'
  if (!hotelForm.value.city.trim()) return 'La ciudad es obligatoria.'
  if (!hotelForm.value.image.trim()) return 'La imagen es obligatoria.'
  if (!hotelForm.value.description.trim()) return 'La descripción es obligatoria.'
  return null
}

const openNewHotelForm = () => {
  isEditing.value = false
  editingHotelId.value = null
  hotelForm.value = { name: '', city: '', description: '', image: '', rating: 5, lat: 8.9824, lng: -79.5209 }
  hotelFormError.value = ''
  showHotelForm.value = true
  showRoomForm.value = false
}

const openEditHotelForm = (hotel: Hotel) => {
  isEditing.value = true
  editingHotelId.value = hotel.id
  hotelForm.value = { ...hotel }
  hotelFormError.value = ''
  showHotelForm.value = true
  showRoomForm.value = false
}

const saveHotel = () => {
  const error = validateHotelForm()
  if (error) {
    hotelFormError.value = error
    return
  }

  if (isEditing.value && editingHotelId.value) {
    updateHotel(editingHotelId.value, hotelForm.value)
    showHotelForm.value = false
  } else {
    const newId = addHotel(hotelForm.value)
    showHotelForm.value = false
  }
}

const saveHotelAndStay = () => {
  const error = validateHotelForm()
  if (error) {
    hotelFormError.value = error
    return true // Return true to indicate error
  }

  hotelFormError.value = ''
  if (!isEditing.value) {
    const newId = addHotel(hotelForm.value)
    editingHotelId.value = newId
    isEditing.value = true
  } else if (editingHotelId.value) {
    updateHotel(editingHotelId.value, hotelForm.value)
  }
  return false
}

// Room Management
const showRoomForm = ref(false)
const isEditingRoom = ref(false)
const editingRoomId = ref<string | null>(null)

// Available Icons for Amenities
const availableIcons = [
  { value: 'info', label: 'Info (General)' },
  { value: 'bed', label: 'Cama' },
  { value: 'snowflake', label: 'Aire Acond.' },
  { value: 'tv', label: 'Televisión' },
  { value: 'coffee', label: 'Cafetera' },
  { value: 'sofa', label: 'Sofá / Sala' },
  { value: 'utensils', label: 'Cocina / Comedor' },
  { value: 'headphones', label: 'Insonorización' },
  { value: 'sparkle', label: 'Especial / Limpio' },
  { value: 'briefcase', label: 'Trabajo / Escritorio' },
  { value: 'mountain', label: 'Vista' },
  { value: 'lock', label: 'Seguridad' }
]

// Available amenity categories
const amenityCategories = [
  'Acceso para personas con discapacidad',
  'Habitación',
  'Baño',
  'Entretenimiento',
  'Alimentos y bebidas',
  'Internet',
  'Más'
]

const roomForm = ref({
  name: '',
  type: 'Double' as const,
  pricePerNight: 0,
  capacity: 2,
  images: [''],
  description: '',
  spaceInfo: '',
  roomBreakdown: '',
  highlightAmenities: [] as { icon: string, text: string }[],
  categorizedAmenities: {} as Record<string, string>
})

const roomFormError = ref('')

const toggleAmenityCategory = (category: string, checked: boolean) => {
  if (checked) {
    roomForm.value.categorizedAmenities[category] = ''
  } else {
    delete roomForm.value.categorizedAmenities[category]
  }
}

const showSaveConfirmModal = ref(false)

const handleRoomAddClick = () => {
  if (!isEditing.value) {
    showSaveConfirmModal.value = true
  } else {
    openNewRoomForm()
  }
}

const confirmSaveAndAddRoom = () => {
  const hasError = saveHotelAndStay()
  if (!hasError) {
    showSaveConfirmModal.value = false
    openNewRoomForm()
  }
}

const openNewRoomForm = () => {
  isEditingRoom.value = false
  editingRoomId.value = null
  roomFormError.value = ''
  roomForm.value = { 
    name: '', type: 'Double', pricePerNight: 0, capacity: 2, images: [''], description: '',
    spaceInfo: '', roomBreakdown: '', highlightAmenities: [{ icon: 'bed', text: '' }], categorizedAmenities: {}
  }
  showRoomForm.value = true
}

const openEditRoomForm = (room: Room) => {
  isEditingRoom.value = true
  editingRoomId.value = room.id
  roomFormError.value = ''
  
  const ext = room.extendedDetails
  roomForm.value = { 
    name: room.name, 
    type: room.type, 
    pricePerNight: room.pricePerNight, 
    capacity: room.capacity, 
    images: room.images && room.images.length > 0 ? [...room.images] : (room.image ? [room.image] : ['']), 
    description: room.description,
    spaceInfo: ext?.spaceInfo || '',
    roomBreakdown: ext?.roomBreakdown?.[0]?.beds || '',
    highlightAmenities: ext?.highlightAmenities && ext.highlightAmenities.length > 0 
      ? ext.highlightAmenities.map(a => ({ ...a }))
      : [{ icon: 'bed', text: '' }],
    categorizedAmenities: {}
  }
  
  if (ext?.categorizedAmenities) {
    for (const [key, val] of Object.entries(ext.categorizedAmenities)) {
      if (val && val.length > 0) {
        roomForm.value.categorizedAmenities[key] = val.join(', ')
      }
    }
  }

  showRoomForm.value = true
}

const addImageField = () => {
  roomForm.value.images.push('')
}

const removeImageField = (index: number) => {
  if (roomForm.value.images.length > 1) {
    roomForm.value.images.splice(index, 1)
  }
}

const addHighlightAmenity = () => {
  roomForm.value.highlightAmenities.push({ icon: 'info', text: '' })
}

const removeHighlightAmenity = (index: number) => {
  roomForm.value.highlightAmenities.splice(index, 1)
}

const saveRoom = () => {
  if (editingHotelId.value) {
    roomFormError.value = ''
    
    // IS THE ROOM NUMBER ALREADY IN USE? (Flowchart validation)
    const existingRooms = state.rooms.filter(r => r.hotelId === editingHotelId.value)
    const isDuplicate = existingRooms.some(r => 
      r.name.trim().toLowerCase() === roomForm.value.name.trim().toLowerCase() && 
      r.id !== editingRoomId.value
    )

    if (isDuplicate) {
      roomFormError.value = `Error: La habitación "${roomForm.value.name}" ya existe en este hotel. Elige otro nombre o número.`
      return
    }

    const validImages = roomForm.value.images.filter(img => img.trim() !== '')
    const mainImage = validImages.length > 0 ? validImages[0] : ''

    const extendedDetails: RoomExtendedDetails = {
      spaceInfo: roomForm.value.spaceInfo,
      roomBreakdown: roomForm.value.roomBreakdown ? [{ name: 'Habitación 1', beds: roomForm.value.roomBreakdown }] : [],
      highlightAmenities: roomForm.value.highlightAmenities.filter(a => a.text.trim() !== '').map(a => ({
         icon: a.icon,
         text: a.text.trim()
      })),
      categorizedAmenities: {}
    }

    for (const cat of amenityCategories) {
      const val = roomForm.value.categorizedAmenities[cat]
      if (val !== undefined && val.trim() !== '') {
        extendedDetails.categorizedAmenities![cat] = val.split(',').map(s => s.trim()).filter(Boolean)
      }
    }

    const payload = {
        name: roomForm.value.name,
        type: roomForm.value.type,
        pricePerNight: roomForm.value.pricePerNight,
        capacity: roomForm.value.capacity,
        image: mainImage,
        images: validImages,
        description: roomForm.value.description,
        extendedDetails,
        isAvailable: true
    }

    if (isEditingRoom.value && editingRoomId.value) {
      updateRoom(editingRoomId.value, payload)
    } else {
      addRoom({ ...payload, hotelId: editingHotelId.value })
    }
    showRoomForm.value = false
    isEditingRoom.value = false
    editingRoomId.value = null
  }
}

const getHotelRooms = (hotelId: string | null) => {
  if (!hotelId) return []
  return state.rooms.filter(r => r.hotelId === hotelId)
}

const showDeleteConfirm = ref(false)
const itemToDelete = ref<{type: 'hotel' | 'room', id: string, name: string} | null>(null)

const confirmDeleteRoom = (roomId: string, roomName: string) => {
  itemToDelete.value = { type: 'room', id: roomId, name: roomName }
  showDeleteConfirm.value = true
}

const confirmDeleteHotel = (hotelId: string, hotelName: string) => {
  itemToDelete.value = { type: 'hotel', id: hotelId, name: hotelName }
  showDeleteConfirm.value = true
}

const proceedDelete = () => {
  if (itemToDelete.value) {
    if (itemToDelete.value.type === 'room') {
      deleteRoom(itemToDelete.value.id)
    } else {
      deleteHotel(itemToDelete.value.id)
    }
    showDeleteConfirm.value = false
    itemToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

// Search and Details
const searchCity = ref('')
const filteredHotels = computed(() => {
  if (!searchCity.value) return state.hotels
  const term = searchCity.value.toLowerCase()
  return state.hotels.filter(h => h.city.toLowerCase().includes(term))
})

const selectedHotel = ref<Hotel | null>(null)
const showHotelDetails = ref(false)

const viewHotelDetails = (hotel: Hotel) => {
  selectedHotel.value = hotel
  showHotelDetails.value = true
}

const closeHotelDetails = () => {
  showHotelDetails.value = false
  selectedHotel.value = null
}

const getHotelRoomsCount = (hotelId: string) => {
  return state.rooms.filter(r => r.hotelId === hotelId).length
}

const selectedHotelRooms = computed(() => {
  if (!selectedHotel.value) return []
  return state.rooms.filter(r => r.hotelId === selectedHotel.value!.id)
})

// Reservation Management
const showEditReservation = ref(false)
const editingResId = ref<string | null>(null)
const reservationForm = ref({
  clientName: '',
  clientEmail: '',
  checkIn: '',
  checkOut: '',
  totalPrice: 0,
  status: 'Pending' as 'Pending' | 'Confirmed' | 'Cancelled'
})

const openEditReservation = (res: Reservation) => {
  editingResId.value = res.id
  reservationForm.value = {
    clientName: res.clientName,
    clientEmail: res.clientEmail,
    checkIn: res.checkIn,
    checkOut: res.checkOut,
    totalPrice: res.totalPrice,
    status: res.status
  }
  showEditReservation.value = true
}

const showErrorModal = ref(false)
const errorMessage = ref('')

const triggerError = (msg: string) => {
  errorMessage.value = msg
  showErrorModal.value = true
}

const saveReservation = () => {
  if (editingResId.value) {
    const res = state.reservations.find(r => r.id === editingResId.value)
    if (reservationForm.value.status === 'Confirmed') {
      const room = state.rooms.find(room => room.id === res?.roomId)
      if (!room) {
        triggerError('No se puede confirmar esta reservación porque la habitación ya no existe.')
        return
      }
    }
    updateReservation(editingResId.value, reservationForm.value)
    showEditReservation.value = false
    editingResId.value = null
  }
}

const showCancelResConfirm = ref(false)
const resIdToCancel = ref<string | null>(null)

const handleCancelRes = (id: string) => {
  resIdToCancel.value = id
  showCancelResConfirm.value = true
}

const confirmCancelResAction = () => {
  if (resIdToCancel.value) {
    cancelReservation(resIdToCancel.value)
    showCancelResConfirm.value = false
    resIdToCancel.value = null
  }
}

const handleConfirmRes = (id: string) => {
  const res = state.reservations.find(r => r.id === id)
  const room = state.rooms.find(room => room.id === res?.roomId)
  
  if (!room) {
    triggerError('No se puede confirmar esta reservación porque la habitación ya no existe.')
    return
  }
  
  confirmReservation(id)
}
</script>

<template>
  <div class="view-container">
    <header class="view-header">
      <h1>Panel de Administración</h1>
    </header>
    
    <div class="admin-tabs">
      <button :class="['tab-btn', { active: currentTab === 'dashboard' }]" @click="currentTab = 'dashboard'">Dashboard</button>
      <button :class="['tab-btn', { active: currentTab === 'hotels' }]" @click="currentTab = 'hotels'">Hoteles</button>
      <button :class="['tab-btn', { active: currentTab === 'reservations' }]" @click="currentTab = 'reservations'">Reservaciones</button>
    </div>

    <main class="view-content">
      <!-- DASHBOARD TAB -->
      <div v-if="currentTab === 'dashboard'" class="animate-fade-in">
        <div class="dashboard-grid">
           <div class="dashboard-card">
             <div class="card-icon"><SvgIcon name="hotel" :size="40" /></div>
             <h3>Ocupación Global</h3>
             <p class="stat">{{ occupancyRate }}%</p>
             <p class="sub-stat">{{ occupiedRooms }} de {{ totalRooms }} habitaciones</p>
           </div>
           
           <div class="dashboard-card">
             <div class="card-icon"><SvgIcon name="money" :size="40" /></div>
             <h3>Ingresos Estimados</h3>
             <p class="stat">${{ totalRevenue.toLocaleString() }}</p>
           </div>
           
           <div class="dashboard-card">
             <div class="card-icon"><SvgIcon name="building" :size="40" /></div>
             <h3>Hoteles Activos</h3>
             <p class="stat">{{ state.hotels.length }}</p>
           </div>
        </div>
      </div>

      <!-- HOTELS TAB -->
      <div v-if="currentTab === 'hotels'" class="animate-fade-in">
        <div class="section-header">
          <h2>Gestión de Hoteles</h2>
          <button class="btn btn-primary" @click="openNewHotelForm">+ Nuevo Hotel</button>
        </div>

        <!-- NEW: Search by city -->
        <div class="search-bar-container" v-if="!showHotelForm && !showHotelDetails">
          <div class="input-group">
            <SvgIcon name="search" :size="20" class="search-icon" />
            <input 
              v-model="searchCity" 
              type="text" 
              class="search-input" 
              placeholder="Consultar hoteles por ciudad..." 
            />
          </div>
        </div>

        <div v-if="showHotelForm" class="edit-layout animate-fade-in">
          <div class="form-card">
            <h3>{{ isEditing ? 'Editar Hotel' : 'Crear Nuevo Hotel' }}</h3>
            
            <div v-if="hotelFormError" class="form-error-alert animate-fade-in">
              <SvgIcon name="info" :size="18" />
              <span>{{ hotelFormError }}</span>
            </div>

            <form @submit.prevent="saveHotel" class="form-body">
              <div class="form-row">
                <div class="input-group half">
                  <label class="input-label">Nombre del Hotel</label>
                  <input v-model="hotelForm.name" type="text" class="input-field" required />
                </div>
                <div class="input-group half">
                  <label class="input-label">Ciudad</label>
                  <input v-model="hotelForm.city" type="text" class="input-field" required />
                </div>
              </div>
              <div class="input-group">
                <label class="input-label">URL o Ruta de Imagen</label>
                <input v-model="hotelForm.image" type="text" class="input-field" required />
              </div>
              <div class="input-group">
                <label class="input-label">Descripción</label>
                <textarea v-model="hotelForm.description" class="input-field" rows="3" required></textarea>
              </div>
              <div class="input-group">
                <label class="input-label">Ubicación en el Mapa</label>
                <p class="text-light-sm" style="margin-bottom: 8px;">Haz clic en el mapa o arrastra el marcador para definir la ubicación exacta.</p>
                <LocationPickerMap v-model:lat="hotelForm.lat" v-model:lng="hotelForm.lng" />
              </div>
              <div class="form-row">
                <div class="input-group half">
                  <label class="input-label">Latitud</label>
                  <input v-model="hotelForm.lat" type="number" step="0.000001" class="input-field" required />
                </div>
                <div class="input-group half">
                  <label class="input-label">Longitud</label>
                  <input v-model="hotelForm.lng" type="number" step="0.000001" class="input-field" required />
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="showHotelForm = false">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>

          <!-- ROOM MANAGEMENT (Visible in both Create and Edit modes for consistent design) -->
          <div class="rooms-card">
            <div class="section-header-sm">
              <h4>Habitaciones del Hotel</h4>
              <button class="btn btn-outline" @click="handleRoomAddClick" v-if="!showRoomForm">+ Añadir Habitación</button>
            </div>

            <div class="rooms-scroll-area">
              <!-- Case 1: New Hotel (Must save first) -->
              <div v-if="!isEditing && !showRoomForm" class="rooms-empty-state animate-fade-in">
                <div class="empty-icon-wrapper">
                  <SvgIcon name="info" :size="32" />
                </div>
                <p>Para añadir habitaciones, primero debes guardar la información básica del hotel.</p>
                <button class="btn btn-primary btn-sm" @click="saveHotelAndStay">Guardar y añadir habitaciones</button>
              </div>

              <!-- Case 2: Existing Hotel rooms list -->
              <div v-else-if="!showRoomForm" class="existing-rooms-list">
                <div v-for="room in getHotelRooms(editingHotelId)" :key="room.id" class="mini-room-card">
                  <div class="mini-room-info">
                    <span><strong>{{ room.name }}</strong> ({{ room.type }})</span>
                    <span class="price-badge">${{ room.pricePerNight }}/noche</span>
                  </div>
                  <div class="mini-room-actions">
                    <button type="button" class="btn-edit-room" @click="openEditRoomForm(room)" title="Editar Habitación">
                      <SvgIcon name="edit" :size="16" />
                    </button>
                    <button type="button" class="btn-delete-room" @click="confirmDeleteRoom(room.id, room.name)" title="Eliminar Habitación">
                      <SvgIcon name="close" :size="16" />
                    </button>
                  </div>
                </div>
                <p v-if="isEditing && getHotelRooms(editingHotelId).length === 0" class="text-light-sm">Aún no hay habitaciones creadas.</p>
              </div>

              <div v-if="showRoomForm" class="nested-form-card">
                <h5>{{ isEditingRoom ? 'Editar Habitación' : 'Crear Nueva Habitación' }}</h5>
                <form @submit.prevent="saveRoom">
                  <div v-if="roomFormError" class="form-error-alert">
                    <SvgIcon name="info" :size="16" />
                    {{ roomFormError }}
                  </div>
                  <div class="input-group">
                    <label class="input-label">Nombre o Número de Habitación</label>
                    <input v-model="roomForm.name" type="text" class="input-field" required />
                  </div>
                  <div class="form-row">
                    <div class="input-group half">
                      <label class="input-label">Tipo</label>
                      <select v-model="roomForm.type" class="input-field" required>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Double/Double">Double/Double</option>
                        <option value="Suite">Suite</option>
                      </select>
                    </div>
                    <div class="input-group half">
                      <label class="input-label">Capacidad (pers.)</label>
                      <input v-model="roomForm.capacity" type="number" min="1" class="input-field" required />
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="input-group half">
                      <label class="input-label">Precio por Noche ($)</label>
                      <input v-model="roomForm.pricePerNight" type="number" min="0" class="input-field" required />
                    </div>
                  </div>
                  <div class="input-group">
                    <label class="input-label">Rutas de Imágenes</label>
                    <div v-for="(img, idx) in roomForm.images" :key="idx" class="image-input-row">
                      <input 
                        v-model="roomForm.images[idx]" 
                        type="text" 
                        class="input-field" 
                        :placeholder="idx === 0 ? 'Imagen principal (Obligatoria)' : 'Imagen adicional (Opcional)'" 
                        :required="idx === 0" 
                      />
                      <button type="button" v-if="roomForm.images.length > 1" @click="removeImageField(idx)" class="btn-remove-img" title="Quitar">
                        <SvgIcon name="close" :size="16" />
                      </button>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm mt-2" @click="addImageField">+ Añadir otra imagen</button>
                  </div>
                  <div class="input-group">
                    <label class="input-label">Descripción Breve</label>
                    <textarea v-model="roomForm.description" class="input-field" rows="2" required></textarea>
                  </div>
                  
                  <div class="section-divider">Detalles Avanzados (Opcionales)</div>

                  <div class="form-row">
                    <div class="input-group half">
                      <label class="input-label">Información de Espacio</label>
                      <input v-model="roomForm.spaceInfo" type="text" class="input-field" placeholder="Ej: 1 habitación, 2 personas • 350 pies" />
                    </div>
                    <div class="input-group half">
                      <label class="input-label">Distribución (Camas)</label>
                      <input v-model="roomForm.roomBreakdown" type="text" class="input-field" placeholder="Ej: 1 cama King" />
                    </div>
                  </div>

                  <div class="input-group">
                    <label class="input-label">Amenidades Destacadas (Con Icono)</label>
                    <div v-for="(amenity, idx) in roomForm.highlightAmenities" :key="idx" class="amenity-input-row">
                      <select v-model="amenity.icon" class="input-field icon-select">
                        <option v-for="icon in availableIcons" :key="icon.value" :value="icon.value">{{ icon.label }}</option>
                      </select>
                      <input v-model="amenity.text" type="text" class="input-field" placeholder="Ej: Ropa de cama premium" />
                      <button type="button" v-if="roomForm.highlightAmenities.length > 1" @click="removeHighlightAmenity(idx)" class="btn-remove-img" title="Quitar">
                        <SvgIcon name="close" :size="16" />
                      </button>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm mt-2" @click="addHighlightAmenity">+ Añadir amenidad destacada</button>
                  </div>

                  <div class="section-divider">Amenidades en la unidad</div>
                  <p class="text-light-sm" style="margin-bottom: 12px; font-size: 0.85rem;">Selecciona qué categorías de amenidades deseas añadir a esta habitación.</p>

                  <div class="amenities-toggles" style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
                    <label v-for="cat in amenityCategories" :key="cat" class="toggle-label" style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.9rem;">
                      <input type="checkbox" :checked="roomForm.categorizedAmenities[cat] !== undefined" @change="(e) => toggleAmenityCategory(cat, (e.target as HTMLInputElement).checked)"> {{ cat }}
                    </label>
                  </div>

                  <div class="form-row" style="flex-wrap: wrap;">
                    <div v-for="cat in amenityCategories.filter(c => roomForm.categorizedAmenities[c] !== undefined)" :key="cat" class="input-group half">
                      <label class="input-label">Amenidades: {{ cat }}</label>
                      <textarea v-model="roomForm.categorizedAmenities[cat]" class="input-field" rows="2" placeholder="Separar con comas..."></textarea>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn btn-secondary" @click="showRoomForm = false">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Habitación</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- NEW: Hotel Details View -->
        <div v-if="showHotelDetails && selectedHotel" class="details-card animate-fade-in">
          <div class="details-header">
            <h3>Información General del Hotel</h3>
            <button class="btn-close" @click="closeHotelDetails"><SvgIcon name="close" :size="20" /></button>
          </div>
          <div class="details-content">
            <div class="details-image">
              <img :src="selectedHotel.image" :alt="selectedHotel.name" />
            </div>
            <div class="details-info">
              <h4>{{ selectedHotel.name }}</h4>
              <p class="location"><SvgIcon name="location" :size="16" /> {{ selectedHotel.city }} (Lat: {{ selectedHotel.lat }}, Lng: {{ selectedHotel.lng }})</p>
              <p class="rooms">Habitaciones registradas: <strong>{{ getHotelRoomsCount(selectedHotel.id) }}</strong></p>
              <div class="description-box">
                <h5>Descripción</h5>
                <p>{{ selectedHotel.description }}</p>
              </div>
              <div class="rooms-box" v-if="selectedHotelRooms.length > 0">
                <h5>Habitaciones Registradas</h5>
                <div class="rooms-list">
                  <div v-for="room in selectedHotelRooms" :key="room.id" class="room-item">
                    <img :src="room.image" :alt="room.name" class="room-item-img" />
                    <div class="room-item-info">
                      <h6>{{ room.name }}</h6>
                      <p class="room-meta">{{ room.type }} | Capacidad: {{ room.capacity }} pers. | <strong>${{ room.pricePerNight }}/noche</strong></p>
                    </div>
                    <span class="availability-badge" :class="room.isAvailable ? 'available' : 'occupied'">
                      {{ room.isAvailable ? 'Disponible' : 'Ocupada' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="table-container" v-if="!showHotelForm && !showHotelDetails">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hotel in filteredHotels" :key="hotel.id">
                <td><strong>{{ hotel.name }}</strong></td>
                <td>{{ hotel.city }}</td>
                <td class="action-buttons">
                  <button class="btn btn-secondary btn-sm" @click="viewHotelDetails(hotel)">Ver Info</button>
                  <button class="btn btn-outline btn-sm" @click="openEditHotelForm(hotel)">Editar</button>
                  <button class="btn btn-danger btn-sm" @click="confirmDeleteHotel(hotel.id, hotel.name)">Eliminar</button>
                </td>
              </tr>
              <tr v-if="filteredHotels.length === 0">
                <td colspan="3" class="text-center">No se encontraron hoteles en la ciudad buscada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RESERVATIONS TAB -->
      <div v-if="currentTab === 'reservations'" class="animate-fade-in">
        <div class="section-header" v-if="!showEditReservation">
          <h2>Gestión de Reservaciones</h2>
        </div>
        
        <ReservationList 
          v-if="!showEditReservation"
          :reservations="state.reservations"
          :show-actions="true"
          @cancel="handleCancelRes"
          @confirm="handleConfirmRes"
          @edit="openEditReservation"
        />

        <div v-if="showEditReservation" class="form-card animate-fade-in">
          <h3>Editar Reservación {{ editingResId }}</h3>
          
          <div v-if="editingResId && !state.rooms.find(room => room.id === state.reservations.find(r => r.id === editingResId)?.roomId)" 
               class="form-error-alert animate-fade-in" style="margin-bottom: 20px; background-color: #fff1f2; border-color: #fda4af; color: #be123c;">
            <SvgIcon name="info" :size="18" />
            <span>Atención: La habitación original ha sido eliminada. No es posible confirmar esta reservación.</span>
          </div>

          <form @submit.prevent="saveReservation" class="form-body">
            <div class="input-group">
              <label class="input-label">Nombre del Cliente</label>
              <input v-model="reservationForm.clientName" type="text" class="input-field disabled" disabled />
            </div>
            <div class="input-group">
              <label class="input-label">Email del Cliente</label>
              <input v-model="reservationForm.clientEmail" type="email" class="input-field disabled" disabled />
            </div>
            <div class="form-row">
              <div class="input-group half">
                <label class="input-label">Check-in</label>
                <input v-model="reservationForm.checkIn" type="date" class="input-field" required />
              </div>
              <div class="input-group half">
                <label class="input-label">Check-out</label>
                <input v-model="reservationForm.checkOut" type="date" class="input-field" required />
              </div>
            </div>
            <div class="form-row">
              <div class="input-group half">
                <label class="input-label">Precio Total ($)</label>
                <input v-model="reservationForm.totalPrice" type="number" min="0" class="input-field disabled" disabled />
              </div>
              <div class="input-group half">
                <label class="input-label">Estado</label>
                <select v-model="reservationForm.status" class="input-field" required>
                  <option value="Pending">Pendiente</option>
                  <option value="Confirmed">Confirmada</option>
                  <option value="Cancelled">Cancelada</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showEditReservation = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Custom Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="admin-modal-overlay">
        <div class="admin-modal animate-fade-in">
          <div class="modal-icon-wrapper">
            <SvgIcon name="close" :size="32" class="danger-icon" />
          </div>
          <h3 class="modal-title">Eliminar {{ itemToDelete?.type === 'hotel' ? 'Hotel' : 'Habitación' }}</h3>
          <p class="modal-message">¿Estás seguro que deseas eliminar {{ itemToDelete?.type === 'hotel' ? 'el hotel' : 'la habitación' }} <br><strong>"{{ itemToDelete?.name }}"</strong>?</p>
          <p class="modal-submessage">Esta acción no se puede deshacer{{ itemToDelete?.type === 'hotel' ? ' y se eliminarán también todas sus habitaciones y reservaciones' : '' }}.</p>
          <div class="modal-actions-container">
            <button class="btn btn-secondary" @click="cancelDelete">Cancelar</button>
            <button class="btn-danger-action" @click="proceedDelete">Eliminar</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Custom Confirmation Modal (Premium Design) -->
    <div v-if="showSaveConfirmModal" class="admin-modal-overlay animate-fade-in">
      <div class="admin-modal animate-slide-up">
        <div class="modal-icon-wrapper info-icon">
          <SvgIcon name="info" :size="32" />
        </div>
        <h3 class="modal-title">Acción Requerida</h3>
        <p class="modal-message">Para añadir habitaciones, primero debemos guardar la información del hotel.</p>
        <p class="modal-submessage" style="color: var(--color-text-light); margin-top: 8px;">¿Deseas guardar los cambios actuales y continuar?</p>
        <div class="modal-actions-container">
          <button class="btn btn-secondary" @click="showSaveConfirmModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="confirmSaveAndAddRoom">Guardar y Continuar</button>
        </div>
      </div>
    </div>
    <!-- Modal de Confirmación para Cancelar Reservación -->
    <div v-if="showCancelResConfirm" class="admin-modal-overlay animate-fade-in">
      <div class="admin-modal animate-slide-up">
        <div class="modal-icon-wrapper danger-icon">
          <SvgIcon name="close" :size="32" />
        </div>
        <h3 class="modal-title">Cancelar Reservación</h3>
        <p class="modal-message">¿Estás seguro de que deseas cancelar esta reservación?</p>
        <p class="modal-submessage">Esta acción no se puede deshacer.</p>
        <div class="modal-actions-container">
          <button class="btn btn-secondary" @click="showCancelResConfirm = false">Volver</button>
          <button class="btn-danger-action" @click="confirmCancelResAction">Confirmar Cancelación</button>
        </div>
      </div>
    </div>

    <!-- Modal de Error/Advertencia Personalizado -->
    <div v-if="showErrorModal" class="admin-modal-overlay animate-fade-in">
      <div class="admin-modal animate-slide-up">
        <div class="modal-icon-wrapper danger-icon">
          <SvgIcon name="info" :size="32" />
        </div>
        <h3 class="modal-title">Operación No Permitida</h3>
        <p class="modal-message">{{ errorMessage }}</p>
        <div class="modal-actions-container" style="margin-top: 24px;">
          <button class="btn btn-primary" @click="showErrorModal = false">Entendido</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: var(--spacing-md);
}

.view-header h1 {
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
}

.admin-tabs {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-background);
  padding-bottom: var(--spacing-xs);
}

.tab-btn {
  background: none;
  border: none;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-light);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom: 3px solid var(--color-primary);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.dashboard-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.dashboard-card h3 {
  color: var(--color-text-light);
  font-size: var(--font-size-md);
  text-transform: uppercase;
}

.stat {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.sub-stat {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.form-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  max-width: none;
  margin: 0 auto;
  max-height: 692px;
  overflow-y: auto;
  padding: var(--spacing-xl);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.form-card::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.form-card::-webkit-scrollbar-track {
  background: transparent;
}

.form-card::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.form-card::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.form-card::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.form-card h3 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-background);
  padding-bottom: var(--spacing-sm);
}

.table-container {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background-color: var(--color-background);
  color: var(--color-text-light);
  font-weight: 600;
  padding: var(--spacing-md);
  text-transform: uppercase;
  font-size: var(--font-size-sm);
}

.data-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-background);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.search-bar-container {
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
}

.search-bar-container .input-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-light);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  transition: all 0.2s;
  background-color: var(--color-surface);
}

.search-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary-light);
}

.btn-danger {
  background-color: #fee2e2;
  color: #ef4444;
  border: 1px solid #fca5a5;
}

.btn-danger:hover {
  background-color: #fecaca;
  color: #dc2626;
  border-color: #ef4444;
}

.details-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-background);
  border-bottom: 1px solid #e2e8f0;
}

.details-header h3 {
  color: var(--color-primary);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.btn-close:hover {
  color: var(--color-danger);
}

.details-content {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .details-content {
    flex-direction: row;
  }
}

.details-image {
  flex: 0 0 350px;
}

.details-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 250px;
}

.details-info {
  padding: var(--spacing-xl);
  flex: 1;
}

.details-info h4 {
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.details-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.details-info .rating {
  color: #f59e0b;
  font-weight: 600;
}

.details-info .rooms strong {
  color: var(--color-primary);
}

.description-box {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid #e2e8f0;
}

.description-box h5 {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.rooms-box {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid #e2e8f0;
}

.rooms-box h5 {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.rooms-list::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.rooms-list::-webkit-scrollbar-track {
  background: transparent;
}

.rooms-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.rooms-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.rooms-list::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.room-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--radius-md);
  align-items: center;
}

.availability-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.availability-badge.available {
  background: #dcfce7;
  color: #15803d;
}

.availability-badge.occupied {
  background: #fee2e2;
  color: #dc2626;
}

.room-item-img {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.room-item-info h6 {
  font-size: var(--font-size-sm);
  margin: 0 0 4px 0;
  color: var(--color-text);
}

.details-info .room-item-info p.room-meta {
  font-size: 12px;
  margin: 0;
  color: var(--color-text-light);
  display: block;
}

.room-item-info p.room-meta strong {
  color: var(--color-primary);
}

.text-center {
  text-align: center;
  padding: var(--spacing-xl) !important;
  color: var(--color-text-light);
}

.edit-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 900px) {
  .edit-layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .edit-layout .form-card {
    margin: 0;
    flex: 1.2;
    max-width: none;
  }
}

.rooms-card {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  flex: 1;
  max-width: 550px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.rooms-scroll-area {
  max-height: 550px;
  overflow-y: auto;
  padding-right: 8px;
  margin-top: var(--spacing-md);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.rooms-scroll-area::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.rooms-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.rooms-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.rooms-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.rooms-scroll-area::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.section-header-sm {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header-sm h4 {
  color: var(--color-primary);
  margin: 0;
  font-size: var(--font-size-lg);
}

.existing-rooms-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.mini-room-card {
  display: flex;
  justify-content: space-between;
  background: var(--color-background);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  align-items: center;
}

.mini-room-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-badge {
  font-size: 12px;
  color: var(--color-text-light);
}

.mini-room-actions {
  display: flex;
  gap: 4px;
}

.btn-delete-room, .btn-edit-room {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-delete-room {
  color: #ef4444;
}

.btn-delete-room:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.btn-edit-room {
  color: var(--color-primary);
}

.btn-edit-room:hover {
  background: var(--color-primary-light);
}

.text-light-sm {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.nested-form-card {
  background: var(--color-background);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid #e2e8f0;
}

.nested-form-card h5 {
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.form-row .half {
  flex: 1;
}

.image-input-row,
.amenity-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.icon-select {
  width: 140px;
  flex-shrink: 0;
}

.btn-remove-img {
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-img:hover {
  background: #fecaca;
}

.mt-2 {
  margin-top: 8px;
}

.section-divider {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  border-bottom: 1px dashed var(--color-primary-light);
  margin: var(--spacing-lg) 0 var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  font-weight: 600;
}

/* Custom Modal Styles */
.admin-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.admin-modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.modal-icon-wrapper {
  background-color: #fee2e2;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto var(--spacing-md);
}

.info-icon {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.danger-icon {
  color: #ef4444;
}

.modal-title {
  color: var(--color-text);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}

.modal-message {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
  line-height: 1.5;
}

.modal-message strong {
  color: var(--color-text);
}

.modal-submessage {
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.modal-actions-container {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.modal-actions-container .btn {
  flex: 1;
}

.btn-danger-action {
  flex: 1;
  background-color: #ef4444;
  color: white;
  border: none;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: var(--font-size-md);
}

.btn-danger-action:hover {
  background-color: #dc2626;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);
}

.rooms-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  background: var(--color-background);
  border-radius: var(--radius-md);
  border: 2px dashed #e2e8f0;
  height: 100%;
}

.empty-icon-wrapper {
  background-color: #f1f5f9;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  color: var(--color-primary);
}

.rooms-empty-state p {
  color: var(--color-text-light);
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.form-error-alert {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1px solid #fecaca;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.input-field.disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  color: var(--color-text-light);
  border-color: #e2e8f0;
}
</style>
