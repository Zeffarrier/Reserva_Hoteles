<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Room } from '../store/hotelStore'
import { useHotelStore } from '../store/hotelStore'
import DateRangePicker from './DateRangePicker.vue'
import SvgIcon from './SvgIcon.vue'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'

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

const cardNumberRef = ref<HTMLElement | null>(null)
const cardExpiryRef = ref<HTMLElement | null>(null)
const cardCvcRef = ref<HTMLElement | null>(null)
const cardName = ref('')

let stripe: Stripe | null = null
let elements: StripeElements | null = null
let cardNumber: any = null
let cardExpiry: any = null
let cardCvc: any = null

const stripeError = ref('')
const isCardNumberComplete = ref(false)
const isCardExpiryComplete = ref(false)
const isCardCvcComplete = ref(false)

const isStripeComplete = computed(() => {
  return isCardNumberComplete.value && isCardExpiryComplete.value && isCardCvcComplete.value && cardName.value.trim() !== ''
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

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  stripe = await loadStripe('pk_test_51TP5b42d58jTB0VSFEvgLVudhzB6273m8AIBG7V0aFBM5hufeIj5bOtn5QqAjyxG9UGuB6raOfyaip6qNyRNV2Qp00UOf3T0Jc')
  if (stripe && cardNumberRef.value && cardExpiryRef.value && cardCvcRef.value) {
    elements = stripe.elements()
    const elementStyles = {
      base: {
        iconColor: '#2d3748',
        color: '#2d3748',
        fontWeight: '400',
        fontFamily: 'Inter, Roboto, Open Sans, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': { color: '#2d3748' },
        '::placeholder': { color: '#a0aec0' },
      },
      invalid: {
        iconColor: '#e53e3e',
        color: '#e53e3e',
      },
    }

    cardNumber = elements.create('cardNumber', { style: elementStyles, showIcon: false })
    cardExpiry = elements.create('cardExpiry', { style: elementStyles })
    cardCvc = elements.create('cardCvc', { style: elementStyles })

    cardNumber.mount(cardNumberRef.value)
    cardExpiry.mount(cardExpiryRef.value)
    cardCvc.mount(cardCvcRef.value)

    const handleChange = (event: any, type: string) => {
      if (type === 'number') isCardNumberComplete.value = event.complete
      if (type === 'expiry') isCardExpiryComplete.value = event.complete
      if (type === 'cvc') isCardCvcComplete.value = event.complete
      if (event.error) stripeError.value = event.error.message
      else stripeError.value = ''
    }

    cardNumber.on('change', (e: any) => handleChange(e, 'number'))
    cardExpiry.on('change', (e: any) => handleChange(e, 'expiry'))
    cardCvc.on('change', (e: any) => handleChange(e, 'cvc'))
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (cardNumber) cardNumber.destroy()
  if (cardExpiry) cardExpiry.destroy()
  if (cardCvc) cardCvc.destroy()
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
         totalDays.value > 0 &&
         isStripeComplete.value
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

      <!-- Stripe Payment Details -->
      <div class="payment-section">
        <div class="payment-header">
          <h3 style="margin: 0;">Datos de la tarjeta</h3>
        </div>
        
        <div class="card-brands-row">
          <div class="brand-badge" style="background:#006fcf; color:#fff;">AMEX</div>
          <div class="brand-badge" style="background:#003666; color:#fff; font-style: italic;">UnionPay</div>
          <div class="brand-badge" style="background:#00508a; color:#fff;">Diners</div>
          <div class="brand-badge" style="background:#ff6000; color:#fff; font-style: italic;">DISCOVER</div>
          <div class="brand-badge" style="background:#0b3a82; color:#fff;">JCB</div>
          <div class="brand-badge mastercard">
            <div class="mc-red"></div><div class="mc-yellow"></div>
          </div>
          <div class="brand-badge" style="background:#1a1f71; color:#fff; font-weight: bold; font-style: italic;">VISA</div>
        </div>

        <div class="custom-card-form">
          <div class="stripe-field-wrapper">
            <label class="stripe-custom-label">Nombre que figura en la tarjeta <span class="required">*</span></label>
            <input type="text" v-model="cardName" class="stripe-custom-input" />
          </div>

          <div class="stripe-field-wrapper with-icon">
            <div class="field-icon">
              <SvgIcon name="lock" :size="22" />
            </div>
            <div class="field-content">
              <label class="stripe-custom-label">Número de la tarjeta <span class="required">*</span></label>
              <div ref="cardNumberRef" class="stripe-element"></div>
            </div>
          </div>

          <div class="stripe-row">
            <div class="stripe-field-wrapper half">
              <label class="stripe-custom-label">Fecha de vencimiento <span class="required">*</span></label>
              <div ref="cardExpiryRef" class="stripe-element"></div>
            </div>
            <div class="stripe-field-wrapper half with-info">
              <label class="stripe-custom-label">
                Código de seguridad <span class="required">*</span>
              </label>
              <SvgIcon name="info" :size="18" class="info-icon" />
              <div ref="cardCvcRef" class="stripe-element"></div>
            </div>
          </div>
          <div v-if="stripeError" class="stripe-error">{{ stripeError }}</div>
        </div>
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
  max-width: 650px;
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

.payment-section {
  margin-top: var(--spacing-xl);
}

.payment-header {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.card-brands-row {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.brand-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  height: 24px;
  min-width: 40px;
}

.brand-badge.mastercard {
  display: flex;
  gap: -4px;
  background: transparent;
  padding: 0 4px;
}

.mc-red, .mc-yellow {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.mc-red { background: #eb001b; z-index: 1; margin-right: -6px; }
.mc-yellow { background: #f79e1b; opacity: 0.9; }

.custom-card-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stripe-field-wrapper {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.2s;
  position: relative;
}

.stripe-field-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.stripe-field-wrapper.with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
}

.field-icon {
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-content {
  flex: 1;
}

.stripe-custom-label {
  display: block;
  font-size: 14px;
  color: #334155;
  margin-bottom: 6px;
}

.stripe-custom-label .required {
  color: #e53e3e;
}

.stripe-custom-input {
  width: 100%;
  border: none;
  font-family: inherit;
  font-size: 16px;
  color: #2d3748;
  outline: none;
  background: transparent;
  padding: 0;
}

.stripe-element {
  min-height: 20px;
}

.stripe-row {
  display: flex;
  gap: var(--spacing-md);
}

.stripe-row .half {
  flex: 1;
}

.stripe-field-wrapper.with-info {
  position: relative;
}

.info-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.stripe-error {
  color: #e53e3e;
  font-size: var(--font-size-sm);
  margin-top: -4px;
}
</style>
