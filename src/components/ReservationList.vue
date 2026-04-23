<script setup lang="ts">
import type { Reservation } from '../store/hotelStore'
import { useHotelStore } from '../store/hotelStore'

defineProps<{
  reservations: Reservation[]
  showActions: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel', id: string): void
  (e: 'confirm', id: string): void
  (e: 'edit', reservation: Reservation): void
}>()

const statusClass = (status: string) => {
  if (status === 'Confirmed') return 'badge-success'
  if (status === 'Pending') return 'badge-warning'
  return 'badge-danger'
}

const statusText = (status: string) => {
  if (status === 'Confirmed') return 'Confirmada'
  if (status === 'Pending') return 'Pendiente'
  return 'Cancelada'
}

const { state } = useHotelStore()

const getRoomDetails = (roomId: string) => {
  const room = state.rooms.find(r => r.id === roomId)
  if (!room) return { roomName: 'Habitación Eliminada', hotelName: 'Hotel Desconocido', isDeleted: true }
  const hotel = state.hotels.find(h => h.id === room.hotelId)
  return { 
    roomName: room.name, 
    hotelName: hotel ? hotel.name : 'Hotel Desconocido',
    isDeleted: false
  }
}
</script>

<template>
  <div class="reservation-list">
    <div v-if="reservations.length === 0" class="empty-state">
      <p>No hay reservaciones para mostrar.</p>
    </div>
    
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Hotel / Habitación</th>
            <th>Fechas</th>
            <th>Total</th>
            <th>Estado</th>
            <th v-if="showActions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in reservations" :key="res.id" class="animate-fade-in">
            <td class="res-id">{{ res.id }}</td>
            <td>
              <div class="client-info">
                <span class="client-name">{{ res.clientName }}</span>
                <span class="client-email">{{ res.clientEmail }}</span>
              </div>
            </td>
            <td>
              <div class="client-info">
                <span class="client-name" :class="{ 'text-danger': getRoomDetails(res.roomId).isDeleted }">{{ getRoomDetails(res.roomId).hotelName }}</span>
                <span class="client-email" :class="{ 'text-danger': getRoomDetails(res.roomId).isDeleted }">{{ getRoomDetails(res.roomId).roomName }}</span>
              </div>
            </td>
            <td>
              <div class="dates-info">
                <span>In: {{ res.checkIn }}</span>
                <span>Out: {{ res.checkOut }}</span>
              </div>
            </td>
            <td class="price">${{ res.totalPrice }}</td>
            <td>
              <span class="badge" :class="statusClass(res.status)">
                {{ statusText(res.status) }}
              </span>
            </td>
            <td v-if="showActions">
              <div class="action-buttons">
                <button 
                  class="btn-icon edit" 
                  @click="emit('edit', res)"
                  title="Editar"
                >
                  ✎
                </button>
                <button 
                  v-if="res.status === 'Pending'" 
                  class="btn-icon confirm" 
                  @click="emit('confirm', res.id)"
                  :title="getRoomDetails(res.roomId).isDeleted ? 'No se puede confirmar: Habitación eliminada' : 'Confirmar'"
                  :disabled="getRoomDetails(res.roomId).isDeleted"
                  :style="getRoomDetails(res.roomId).isDeleted ? 'opacity: 0.5; cursor: not-allowed;' : ''"
                >
                  ✓
                </button>
                <button 
                  v-if="res.status !== 'Cancelled'" 
                  class="btn-icon cancel" 
                  @click="emit('cancel', res.id)"
                  title="Cancelar"
                >
                  ✕
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.reservation-list {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-light);
}

.table-container {
  overflow-x: auto;
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
  font-size: var(--font-size-sm);
  padding: var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-background);
  vertical-align: middle;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.res-id {
  font-family: monospace;
  font-weight: 600;
  color: var(--color-primary);
}

.client-info, .dates-info {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 500;
  color: var(--color-text);
}

.client-email, .dates-info span {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.text-danger {
  color: #dc2626 !important;
}

.price {
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
}

.btn-icon.confirm {
  background-color: var(--color-success-light);
  color: #065f46;
}

.btn-icon.confirm:hover {
  background-color: var(--color-success);
  color: white;
}

.btn-icon.cancel {
  background-color: var(--color-danger-light);
  color: #991b1b;
}

.btn-icon.cancel:hover {
  background-color: var(--color-danger);
  color: white;
}

.btn-icon.edit {
  background-color: #e0e7ff;
  color: #3730a3;
}

.btn-icon.edit:hover {
  background-color: #4f46e5;
  color: white;
}
</style>
