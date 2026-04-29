<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import { bookingService } from '../services/bookingService'

import { hotelService } from '../services/hotelService'
import { roomService } from '../services/roomService'
import ReservationList, { type MappedBooking } from '../components/ReservationList.vue'

const { state, setAuth } = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')

const successMsg = ref('')
const errorMsg = ref('')

const myReservations = ref<MappedBooking[]>([])

const fetchBookings = async () => {
  if (state.currentUser?.id) {
    try {
      const bookings = await bookingService.getUserBookings(state.currentUser.id)
      const mappedBookings: MappedBooking[] = []
      
      for (const b of (bookings || [])) {
        let hotelName = 'Hotel Desconocido'
        let roomName = 'Habitación Eliminada'
        let isDeleted = true
        
        try {
          const hotel = await hotelService.getHotel(b.hotel_id)
          if (hotel) hotelName = hotel.name
          
          const rooms = await roomService.getRoomsByHotel(b.hotel_id)
          const room = rooms?.find(r => r.id === b.room_id)
          if (room) {
            roomName = room.name
            isDeleted = false
          }
        } catch (e) {}

        mappedBookings.push({
          id: b.id,
          clientName: b.guest_name || '',
          clientEmail: b.guest_email || '',
          hotelName,
          roomName,
          checkIn: b.start_date,
          checkOut: b.end_date,
          totalPrice: b.total_price,
          status: b.status,
          isDeleted,
          raw: b
        })
      }
      
      myReservations.value = mappedBookings
    } catch (e) {
      console.error('Error fetching bookings', e)
    }
  }
}

onMounted(() => {
  if (state.currentUser) {
    name.value = state.currentUser.name
    email.value = state.currentUser.email
    fetchBookings()
  }
})

const handleUpdate = async () => {
  successMsg.value = ''
  errorMsg.value = ''
  
  try {
    const res = await authService.updateProfile(state.currentUser!.id, { 
      name: name.value, 
      email: email.value, 
      password: password.value 
    })
    if (state.token) {
      setAuth(res.user, state.token)
    }
    successMsg.value = 'Perfil actualizado correctamente.'
    password.value = ''
  } catch (error: any) {
    errorMsg.value = error.message || 'No se pudo actualizar. Es posible que el correo ya esté en uso.'
  }
}

</script>

<template>
  <div class="view-container">
    <header class="view-header">
      <h1>Mi Perfil</h1>
      <p>Gestiona tu información y revisa tus reservas</p>
    </header>

    <main class="view-content profile-grid">
      <div class="profile-section">
        <h2>Datos Personales</h2>
        
        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>
        <div v-if="errorMsg" class="alert alert-danger">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleUpdate" class="form-body">
          <div class="input-group">
            <label class="input-label" for="name">Nombre Completo</label>
            <input 
              id="name"
              v-model="name" 
              type="text" 
              class="input-field" 
              required
            />
          </div>

          <div class="input-group">
            <label class="input-label" for="email">Correo Electrónico</label>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              class="input-field" 
              required
            />
          </div>

          <div class="input-group">
            <label class="input-label" for="password">Nueva Contraseña (Opcional)</label>
            <input 
              id="password"
              v-model="password" 
              type="password" 
              class="input-field" 
              placeholder="Dejar en blanco para no cambiar"
              minlength="3"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>

      <div class="history-section">
        <h2>Mis Reservaciones</h2>
        <ReservationList 
          :reservations="myReservations"
          :show-actions="false"
        />
      </div>
    </main>
  </div>
</template>

<style scoped>
.view-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: var(--spacing-xl);
}

.view-header h1 {
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.view-header p {
  color: var(--color-text-light);
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-xl);
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.profile-section {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  align-self: start;
}

.profile-section h2, .history-section h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
  border-bottom: 2px solid var(--color-background);
  padding-bottom: var(--spacing-xs);
}

.alert {
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.alert-success {
  background-color: var(--color-success-light);
  color: #065f46;
}

.alert-danger {
  background-color: var(--color-danger-light);
  color: #991b1b;
}

.form-actions {
  margin-top: var(--spacing-lg);
}
</style>
