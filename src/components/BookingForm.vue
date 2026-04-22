<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Room } from '../store/hotelStore'
import { useHotelStore } from '../store/hotelStore'
import DateRangePicker from './DateRangePicker.vue'
import SvgIcon from './SvgIcon.vue'

const props = defineProps<{
  room: Room
}>()

const emit = defineEmits<{
  (e: 'submit', data: { clientName: string; clientEmail: string; clientPhone: string; checkIn: string; checkOut: string; totalPrice: number }): void
  (e: 'cancel'): void
}>()

const { searchDates } = useHotelStore()

const clientName = ref('')
const clientEmail = ref('')
const clientPhone = ref('')
const showDatePicker = ref(false)
const datePickerRef = ref<HTMLElement | null>(null)
const dateRange = ref<{ start: Date | null, end: Date | null }>({
  start: searchDates.start ? new Date(searchDates.start) : null,
  end: searchDates.end ? new Date(searchDates.end) : null
})

const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
}

const closeDatePicker = () => {
  showDatePicker.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target as Node)) {
    showDatePicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const formatDate = (date: Date | null) => {
  if (!date) return '—'
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDateRange = computed(() => {
  if (!dateRange.value.start) return 'Seleccionar fechas'
  const start = formatDate(dateRange.value.start)
  if (!dateRange.value.end) return `${start} — Salida`
  const end = formatDate(dateRange.value.end)
  return `${start} — ${end}`
})

const checkInStr = computed(() => {
  if (!dateRange.value.start) return ''
  return dateRange.value.start.toISOString().split('T')[0]
})

const checkOutStr = computed(() => {
  if (!dateRange.value.end) return ''
  return dateRange.value.end.toISOString().split('T')[0]
})

const totalDays = computed(() => {
  if (!dateRange.value.start || !dateRange.value.end) return 0
  const diffTime = Math.abs(dateRange.value.end.getTime() - dateRange.value.start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const totalPrice = computed(() => {
  return totalDays.value * props.room.pricePerNight
})

const isValid = computed(() => {
  return clientName.value.trim() !== '' && 
         clientEmail.value.includes('@') && 
         clientPhone.value.trim().length >= 6 &&
         dateRange.value.start !== null && 
         dateRange.value.end !== null &&
         totalDays.value > 0
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      clientName: clientName.value,
      clientEmail: clientEmail.value,
      clientPhone: clientPhone.value,
      checkIn: checkInStr.value,
      checkOut: checkOutStr.value,
      totalPrice: totalPrice.value
    })
  }
}
</script>

<template>
  <div class="booking-form animate-fade-in">
    <div class="form-header">
      <h2>Completar Reserva</h2>
      <p>Estás reservando: <strong>{{ room.name }}</strong></p>
    </div>

    <form @submit.prevent="handleSubmit" class="form-body">
      <div class="input-group">
        <label class="input-label" for="name">Nombre Completo</label>
        <input 
          id="name"
          v-model="clientName" 
          type="text" 
          class="input-field" 
          placeholder="Ej: Ana García"
          required
        />
      </div>

      <div class="input-group">
        <label class="input-label" for="email">Correo Electrónico</label>
        <input 
          id="email"
          v-model="clientEmail" 
          type="email" 
          class="input-field" 
          placeholder="correo@ejemplo.com"
          required
        />
      </div>

      <div class="input-group">
        <label class="input-label" for="phone">Número de Teléfono</label>
        <input 
          id="phone"
          v-model="clientPhone" 
          type="tel" 
          class="input-field" 
          placeholder="Ej: +507 6000-0000"
          required
        />
      </div>

      <!-- Date Range Picker -->
      <div class="input-group date-picker-group" ref="datePickerRef">
        <label class="input-label">Fechas de estadía</label>
        <div class="date-selector" @click="toggleDatePicker">
          <SvgIcon name="calendar" :size="18" />
          <span :class="{ 'placeholder': !dateRange.start }">{{ formatDateRange }}</span>
        </div>
        <DateRangePicker 
          v-if="showDatePicker"
          v-model="dateRange"
          @close="closeDatePicker"
        />
      </div>

      <!-- Visibility of System Status (Nielsen): Real-time price calculation -->
      <div v-if="totalDays > 0" class="summary-box">
        <div class="summary-row">
          <span>Estancia ({{ totalDays }} noches x ${{ room.pricePerNight }})</span>
          <span>${{ totalPrice }}</span>
        </div>
        <div class="summary-total">
          <span>Total a Pagar</span>
          <span>${{ totalPrice }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="emit('cancel')">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="!isValid">Confirmar y Pagar</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.booking-form {
  background: var(--color-surface);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.form-header h2 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.date-picker-group {
  position: relative;
}

.date-picker-group :deep(.date-picker-container) {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  max-width: 95vw;
  z-index: 50;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: none;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 12px 16px;
  background: var(--color-background);
  border: 1px solid var(--color-background);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-md);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.date-selector:hover {
  border-color: var(--color-primary);
}

.date-selector .placeholder {
  color: var(--color-text-light);
}

.summary-box {
  background: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin: var(--spacing-lg) 0;
  border: 1px dashed var(--color-primary-light);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  border-top: 1px solid #e2e8f0;
  padding-top: var(--spacing-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}
</style>
