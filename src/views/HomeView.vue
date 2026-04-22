<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useHotelStore } from '../store/hotelStore'
import HotelCard from '../components/HotelCard.vue'
import DateRangePicker from '../components/DateRangePicker.vue'
import GuestSelector from '../components/GuestSelector.vue'
import SvgIcon from '../components/SvgIcon.vue'
import { useRouter } from 'vue-router'

const { state, getHotelsByCity, searchDates } = useHotelStore()
const searchCity = ref('')
const showDatePicker = ref(false)
const showGuestPicker = ref(false)
const selectedDateRange = ref<{ start: Date | null, end: Date | null }>({
  start: searchDates.start,
  end: searchDates.end
})
const guestsState = ref({ adults: 2, children: 0, rooms: 1, pets: false })
const searchBarRef = ref<HTMLElement | null>(null)
const router = useRouter()

const openMap = () => {
  router.push('/mapa')
}

const handleClickOutside = (event: MouseEvent) => {
  if (searchBarRef.value && !searchBarRef.value.contains(event.target as Node)) {
    showDatePicker.value = false
    showGuestPicker.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
  if (showDatePicker.value) showGuestPicker.value = false
}

const toggleGuestPicker = () => {
  showGuestPicker.value = !showGuestPicker.value
  if (showGuestPicker.value) showDatePicker.value = false
}


const formatGuestsText = computed(() => {
  const { adults, children, rooms } = guestsState.value
  const people = adults + children
  return `${people} persona${people > 1 ? 's' : ''}, ${rooms} hab`
})

const formatDateRange = computed(() => {
  if (!selectedDateRange.value.start) return 'Agregar fechas'
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
  const start = selectedDateRange.value.start.toLocaleDateString('es-ES', options).replace('.', '')
  if (!selectedDateRange.value.end) return `${start} — Salida`
  const end = selectedDateRange.value.end.toLocaleDateString('es-ES', options).replace('.', '')
  return `${start} — ${end}`
})

// Sincronizar fechas con el store global
watch(selectedDateRange, (newDates) => {
  searchDates.start = newDates.start
  searchDates.end = newDates.end
}, { deep: true })

const filteredHotels = computed(() => {
  let result = state.hotels

  // 1. Filtrar por ciudad
  if (searchCity.value.trim()) {
    const lower = searchCity.value.toLowerCase()
    result = result.filter(h => h.city.toLowerCase().includes(lower))
  }

  // 2. Filtrar por capacidad (Huéspedes)
  const totalGuests = guestsState.value.adults + guestsState.value.children

  // 3. Evaluar disponibilidad de habitaciones
  result = result.filter(hotel => {
    const hotelRooms = state.rooms.filter(r => r.hotelId === hotel.id)
    
    // El hotel pasa el filtro si tiene AL MENOS UNA habitación disponible
    return hotelRooms.some(room => {
      // Verificación base: capacidad suficiente y no estar bloqueada manualmente
      let isRoomAvailable = room.isAvailable && room.capacity >= totalGuests

      // Verificación de fechas: si el usuario seleccionó un rango, validamos contra reservas existentes
      if (isRoomAvailable && selectedDateRange.value.start && selectedDateRange.value.end) {
        const searchStart = selectedDateRange.value.start.getTime()
        const searchEnd = selectedDateRange.value.end.getTime()
        
        const hasOverlap = state.reservations.some(res => {
          if (res.roomId !== room.id || res.status === 'Cancelled') return false
          const resStart = new Date(res.checkIn).getTime()
          const resEnd = new Date(res.checkOut).getTime()
          
          // Hay solapamiento si la fecha de entrada buscada es menor a la salida reservada
          // Y la fecha de salida buscada es mayor a la entrada reservada.
          return searchStart < resEnd && searchEnd > resStart
        })
        
        if (hasOverlap) isRoomAvailable = false
      }

      return isRoomAvailable
    })
  })

  return result
})
</script>

<template>
  <div class="view-container">
    <header class="view-header hero-section">
      <h1>Encuentra tu próximo destino</h1>
      <p>Descubre hoteles de lujo en las mejores ciudades</p>
      
      <div class="search-bar-complex animate-fade-in" ref="searchBarRef">
        <div class="search-field">
          <span class="field-icon"><SvgIcon name="location" :size="22" /></span>
          <div class="field-content">
            <label>¿A dónde quieres ir?</label>
            <input 
              v-model="searchCity"
              type="text" 
              placeholder="Ej. Panamá"
              class="search-input"
            />
          </div>
        </div>
        
        <div class="field-divider"></div>
        
        <div class="search-field date-field" @click="toggleDatePicker">
          <span class="field-icon"><SvgIcon name="calendar" :size="22" /></span>
          <div class="field-content">
            <label>Fechas</label>
            <div class="date-display">{{ formatDateRange }}</div>
          </div>
        </div>
        
        <!-- Popover Calendar -->
        <div v-if="showDatePicker" class="date-picker-popover">
          <DateRangePicker 
            v-model="selectedDateRange" 
            @close="showDatePicker = false"
          />
        </div>
        
        <div class="field-divider"></div>
        
        <div class="search-field" @click="toggleGuestPicker">
          <span class="field-icon"><SvgIcon name="users" :size="22" /></span>
          <div class="field-content">
            <label>Huéspedes</label>
            <div class="date-display">{{ formatGuestsText }}</div>
          </div>
        </div>

        <!-- Popover Guests -->
        <div v-if="showGuestPicker" class="guest-picker-popover">
          <GuestSelector 
            v-model="guestsState" 
            @close="showGuestPicker = false"
          />
        </div>
        
        <button class="btn-search" @click="searchCity = searchCity.trim()">
          Buscar
        </button>
      </div>
    </header>
    
    <main class="view-content">
      <div class="content-layout">
        <!-- Mapa -->
        <aside class="map-section" @click="openMap">
          <div class="map-preview">
            <img 
              src="https://maps.googleapis.com/maps/api/staticmap?center=8.9824,-79.5209&zoom=12&size=600x400&key=AIzaSyBOP6rZY97H8kO9RKyDT0ondn7iBMXCj0E" 
              alt="Mapa de hoteles" 
              class="map-preview-img"
            />
            <div class="map-overlay">
              <div class="map-overlay-pin">
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                  <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24C32 7.164 24.836 0 16 0z" fill="#2563eb"/>
                  <circle cx="16" cy="15" r="6" fill="white"/>
                </svg>
              </div>
              <div class="map-overlay-btn">Ver hoteles en el mapa</div>
            </div>
          </div>
        </aside>

        <!-- Lista de Hoteles -->
        <div class="list-section">
          <div class="results-header">
            <h2>{{ searchCity ? `Resultados para "${searchCity}"` : 'Hoteles Destacados' }}</h2>
            <span class="results-count">{{ filteredHotels.length }} hoteles encontrados</span>
          </div>

          <div v-if="filteredHotels.length > 0" class="hotels-grid">
            <HotelCard 
              v-for="hotel in filteredHotels" 
              :key="hotel.id" 
              :hotel="hotel" 
            />
          </div>
          
          <div v-else class="empty-state animate-fade-in">
            <div class="empty-icon"><SvgIcon name="city" :size="56" /></div>
            <h3>No encontramos hoteles en esta ciudad</h3>
            <p>Intenta buscar otro destino o revisa nuestra lista de hoteles destacados borrando la búsqueda.</p>
            <button class="btn btn-primary" @click="searchCity = ''">Ver todos los hoteles</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.view-container {
  padding: 0; /* Hero section takes full width */
}

.hero-section {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.hero-section h1 {
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
}

.hero-section p {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-xl);
}

.search-bar-complex {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 999px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px;
  color: var(--color-text);
  position: relative;
  z-index: 1000;
}

.date-picker-popover,
.guest-picker-popover {
  position: absolute;
  top: calc(100% + 12px);
  z-index: 100;
}

.date-picker-popover {
  left: 30%;
}

.guest-picker-popover {
  right: 15%;
}

.date-display {
  font-size: 0.95rem;
  color: var(--color-text-light);
  white-space: nowrap;
}

.search-field {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 24px;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s;
}

.search-field:hover {
  background: var(--color-background);
}

.field-icon {
  font-size: 1.5rem;
  margin-right: 16px;
  color: var(--color-primary);
}

.field-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.field-content label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text);
  margin-bottom: 2px;
  cursor: pointer;
  white-space: nowrap;
}

.search-input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 0.95rem;
  color: var(--color-text-light);
  outline: none;
  cursor: pointer;
  font-family: inherit;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.date-input {
  padding: 0;
  color: var(--color-text-light);
}

.date-separator {
  color: #ccc;
}

.select-input {
  appearance: none;
  -webkit-appearance: none;
  padding: 0;
}

.search-input:focus {
  color: var(--color-text);
}

.search-input::placeholder {
  color: #a0a0a0;
}

.field-divider {
  width: 1px;
  height: 32px;
  background-color: #ddd;
  margin: 0 8px;
}

.btn-search {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 999px;
  padding: 14px 32px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-search:hover {
  background: var(--color-primary-dark);
}

.btn-search:active {
  transform: scale(0.98);
}

.view-content {
  max-width: 1400px; /* Wider to accommodate map */
  margin: 0 auto;
  padding: 0 var(--spacing-lg) var(--spacing-xl);
}

.content-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

.map-section {
  position: sticky;
  top: 100px;
  height: 200px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.map-section:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.map-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(2px);
  cursor: pointer;
  z-index: 5;
  transition: opacity 0.3s ease;
}

.map-overlay:hover {
  background: rgba(255, 255, 255, 0.35);
}

.map-overlay-pin {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  animation: bounce-pin 2s ease infinite;
}

@keyframes bounce-pin {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.map-overlay-btn {
  background: #2563eb;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
  .map-section {
    position: static;
    height: 200px;
    margin-top: var(--spacing-lg);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.results-header h2 {
  font-size: var(--font-size-xl);
  color: var(--color-text);
}

.results-count {
  color: var(--color-text-light);
  font-weight: 500;
}

.hotels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-lg);
}
</style>
