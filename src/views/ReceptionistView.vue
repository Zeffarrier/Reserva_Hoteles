<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHotelStore, type Hotel, type Reservation } from '../store/hotelStore'
import ReservationList from '../components/ReservationList.vue'
import CustomDialog from '../components/CustomDialog.vue'
import SvgIcon from '../components/SvgIcon.vue'

const { state, confirmReservation, cancelReservation, updateReservation } = useHotelStore()

// Generic Dialog State
const dialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  isDanger: false,
  showCancel: false,
  onConfirm: () => {}
})

const triggerDialog = (title: string, message: string, onConfirm = () => {}, isDanger = false, showCancel = true, confirmText?: string) => {
  dialog.value = {
    show: true,
    title,
    message,
    confirmText: confirmText || (isDanger ? 'Eliminar' : 'Confirmar'),
    cancelText: 'Cancelar',
    isDanger,
    showCancel,
    onConfirm: () => {
      onConfirm()
      dialog.value.show = false
    }
  }
}

const handleConfirm = (id: string) => {
  const res = state.reservations.find(r => r.id === id)
  if (res) {
    const roomExists = state.rooms.some(r => r.id === res.roomId)
    if (!roomExists) {
      triggerDialog('Error de Validación', 'No puedes aprobar esta reserva. La habitación asociada ya no existe o fue eliminada del sistema.', () => {}, true, false, 'Entendido')
      return
    }
  }
  triggerDialog(
    'Confirmar Reserva',
    `¿Estás seguro de confirmar la reserva <strong>${id}</strong>?`,
    () => confirmReservation(id)
  )
}

const handleCancel = (id: string) => {
  triggerDialog(
    'Cancelar Reserva',
    `ATENCIÓN: ¿Estás seguro de cancelar la reserva <strong>${id}</strong>? Esta acción liberará la habitación.`,
    () => cancelReservation(id),
    true
  )
}

// Edit Reservation
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

const showErrorModal = ref(false)
const errorMessage = ref('')

const triggerError = (msg: string) => {
  errorMessage.value = msg
  showErrorModal.value = true
}

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

// Hotel Management (View Only)
const currentTab = ref<'reservations' | 'hotels'>('reservations')

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
</script>

<template>
<div class="view-container">
  <header class="view-header">
    <h1>Panel de Recepción</h1>
    <p>Gestión diaria de reservas y ocupación</p>
  </header>

  <div class="admin-tabs">
    <button :class="['tab-btn', { active: currentTab === 'reservations' }]" @click="currentTab = 'reservations'">Reservaciones</button>
    <button :class="['tab-btn', { active: currentTab === 'hotels' }]" @click="currentTab = 'hotels'">Hoteles</button>
  </div>

  <div class="view-content">
    <!-- RESERVATIONS TAB -->
    <div v-if="currentTab === 'reservations'" class="animate-fade-in">
      <div class="section-header" v-if="!showEditReservation">
        <h2>Gestión de Reservaciones</h2>
      </div>

      <ReservationList
        v-if="!showEditReservation"
        :reservations="state.reservations"
        :show-actions="true"
        @confirm="handleConfirm"
        @cancel="handleCancel"
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

    <!-- HOTELS TAB -->
    <div v-if="currentTab === 'hotels'" class="animate-fade-in">
      <div class="section-header">
        <h2>Gestión de Hoteles</h2>
        <button class="btn btn-primary" @click="openNewHotelForm" style="display:none;">+ Nuevo Hotel</button>
      </div>

      <!-- Search by city -->
      <div class="search-bar-container">
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

      <!-- Hotel Details View -->
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

      <div class="table-container" v-if="!showHotelDetails">
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
              </td>
            </tr>
            <tr v-if="filteredHotels.length === 0">
              <td colspan="3" class="text-center">No se encontraron hoteles en la ciudad buscada.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <CustomDialog
      :show="dialog.show"
      :title="dialog.title"
      :message="dialog.message"
      :confirm-text="dialog.confirmText"
      :cancel-text="dialog.cancelText"
      :is-danger="dialog.isDanger"
      :show-cancel="dialog.showCancel"
      @confirm="dialog.onConfirm"
      @cancel="dialog.show = false"
    />

    <!-- Error Modal -->
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
  </div>
</template>

<style scoped>
.view-container {
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.view-content {
  /* No additional padding, content padding is handled by children */
}

.view-header {
  margin-bottom: var(--spacing-xl);
}

.view-header h1 {
  font-size: var(--font-size-xxl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
}

.view-header p {
  color: var(--color-text-light);
  font-size: var(--font-size-md);
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

.reservations-section {
  background: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h2 {
  font-size: var(--font-size-lg);
  color: var(--color-text);
}

.badge-primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

/* Hotels Tab Styles */
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

.btn-secondary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-secondary:hover {
  background-color: #dbeafe;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.text-center {
  text-align: center;
  padding: var(--spacing-xl) !important;
  color: var(--color-text-light);
}

/* Hotel Details - identical to AdminView */
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

/* Form Card - same as AdminView */
.form-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.form-card h3 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-background);
  padding-bottom: var(--spacing-sm);
}

.form-body {
  padding: 0;
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.form-row .half {
  flex: 1;
}

.input-group {
  margin-bottom: var(--spacing-md);
}

.input-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.input-field {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  font-family: var(--font-family);
  font-size: var(--font-size-md);
  color: var(--color-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input-field.disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  color: var(--color-text-light);
  border-color: #e2e8f0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.btn-secondary:hover {
  background-color: #dbeafe;
}

/* Modal Styles */
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

.modal-icon-wrapper.danger-icon {
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

.modal-actions-container {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.modal-actions-container .btn {
  flex: 1;
}
</style>
