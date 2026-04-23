<script setup lang="ts">
import { ref } from 'vue'
import { useHotelStore } from '../store/hotelStore'
import ReservationList from '../components/ReservationList.vue'
import CustomDialog from '../components/CustomDialog.vue'

const { state, confirmReservation, cancelReservation } = useHotelStore()

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
</script>

<template>
  <div class="view-container">
    <header class="view-header">
      <h1>Panel de Recepción</h1>
      <p>Gestión diaria de reservas y ocupación</p>
    </header>
    
    <main class="view-content">
      <div class="reservations-section">
        <div class="section-header">
          <h2>Todas las Reservaciones</h2>
          <span class="badge badge-primary">{{ state.reservations.length }} Totales</span>
        </div>
        
        <ReservationList 
          :reservations="state.reservations"
          :show-actions="true"
          @confirm="handleConfirm"
        />
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
  letter-spacing: -0.02em;
}

.view-header p {
  color: var(--color-text-light);
  font-size: var(--font-size-md);
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
</style>
