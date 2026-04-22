<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore, type Hotel } from '../store/hotelStore'
import ReservationList from '../components/ReservationList.vue'
import SvgIcon from '../components/SvgIcon.vue'

const { state, addHotel, updateHotel } = useHotelStore()

const currentTab = ref<'dashboard' | 'hotels' | 'reservations'>('dashboard')

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

const openNewHotelForm = () => {
  isEditing.value = false
  editingHotelId.value = null
  hotelForm.value = { name: '', city: '', description: '', image: '', rating: 5, lat: 8.9824, lng: -79.5209 }
  showHotelForm.value = true
}

const openEditHotelForm = (hotel: Hotel) => {
  isEditing.value = true
  editingHotelId.value = hotel.id
  hotelForm.value = { ...hotel }
  showHotelForm.value = true
}

const saveHotel = () => {
  if (isEditing.value && editingHotelId.value) {
    updateHotel(editingHotelId.value, hotelForm.value)
  } else {
    addHotel(hotelForm.value)
  }
  showHotelForm.value = false
}
</script>

<template>
  <div class="view-container">
    <header class="view-header">
      <h1>Panel de Administración</h1>
      <p>Gestión centralizada del sistema</p>
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

        <div v-if="showHotelForm" class="form-card animate-fade-in">
          <h3>{{ isEditing ? 'Editar Hotel' : 'Crear Nuevo Hotel' }}</h3>
          <form @submit.prevent="saveHotel" class="form-body">
            <div class="input-group">
              <label class="input-label">Nombre del Hotel</label>
              <input v-model="hotelForm.name" type="text" class="input-field" required />
            </div>
            <div class="input-group">
              <label class="input-label">Ciudad</label>
              <input v-model="hotelForm.city" type="text" class="input-field" required />
            </div>
            <div class="input-group">
              <label class="input-label">URL de Imagen</label>
              <input v-model="hotelForm.image" type="url" class="input-field" required />
            </div>
            <div class="input-group">
              <label class="input-label">Descripción</label>
              <textarea v-model="hotelForm.description" class="input-field" rows="3" required></textarea>
            </div>
            <div class="input-group">
              <label class="input-label">Calificación (Estrellas)</label>
              <input v-model="hotelForm.rating" type="number" step="0.5" min="1" max="5" class="input-field" required />
            </div>
            <div class="input-group">
              <label class="input-label">Latitud</label>
              <input v-model="hotelForm.lat" type="number" step="0.0001" class="input-field" required />
            </div>
            <div class="input-group">
              <label class="input-label">Longitud</label>
              <input v-model="hotelForm.lng" type="number" step="0.0001" class="input-field" required />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showHotelForm = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
          </form>
        </div>

        <div class="table-container" v-if="!showHotelForm">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Calificación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hotel in state.hotels" :key="hotel.id">
                <td><strong>{{ hotel.name }}</strong></td>
                <td>{{ hotel.city }}</td>
                <td>{{ hotel.rating }} <SvgIcon name="star" :size="14" /></td>
                <td>
                  <button class="btn btn-secondary btn-sm" @click="openEditHotelForm(hotel)">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RESERVATIONS TAB -->
      <div v-if="currentTab === 'reservations'" class="animate-fade-in">
        <h2>Historial General de Reservaciones</h2>
        <ReservationList 
          :reservations="state.reservations"
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
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  max-width: 600px;
  margin: 0 auto var(--spacing-xl);
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
</style>
