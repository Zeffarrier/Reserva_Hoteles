<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHotelStore } from '../store/hotelStore'
import GoogleMap from '../components/GoogleMap.vue'
import SvgIcon from '../components/SvgIcon.vue'
import type { Hotel } from '../store/hotelStore'

const router = useRouter()
const { state } = useHotelStore()

const hotels = computed(() => state.hotels)
const selectedHotel = ref<Hotel | null>(null)

const goBack = () => {
  router.push('/')
}

const onHotelClicked = (hotel: Hotel) => {
  selectedHotel.value = hotel
}

const viewRooms = () => {
  if (selectedHotel.value) {
    router.push(`/hotel/${selectedHotel.value.id}`)
  }
}
</script>

<template>
  <div class="map-view">
    <div class="map-header">
      <button class="back-btn" @click="goBack">
        <SvgIcon name="arrow-left" :size="16" />
        Volver a hoteles
      </button>
      <h2>Hoteles en el mapa</h2>
      <span class="hotel-count">{{ hotels.length }} hoteles</span>
    </div>
    <div class="map-fullscreen">
      <GoogleMap :hotels="hotels" @hotel-clicked="onHotelClicked" />

      <!-- Selected Hotel Card -->
      <Transition name="slide-up">
        <div v-if="selectedHotel" class="hotel-floating-card">
          <button class="close-card-btn" @click="selectedHotel = null">
            <SvgIcon name="close" :size="20" />
          </button>
          <img :src="selectedHotel.image" :alt="selectedHotel.name" class="hotel-card-img" />
          <div class="hotel-card-content">
            <div class="hotel-meta">
              <span class="hotel-city"><SvgIcon name="location" :size="14" /> {{ selectedHotel.city }}</span>
              <span class="hotel-rating"><SvgIcon name="star" :size="14" /> {{ selectedHotel.rating }}</span>
            </div>
            <h3>{{ selectedHotel.name }}</h3>
            <p class="hotel-desc">{{ selectedHotel.description.length > 80 ? selectedHotel.description.substring(0, 80) + '...' : selectedHotel.description }}</p>
            <button class="btn btn-primary w-full mt-3" style="width: 100%; margin-top: 16px;" @click="viewRooms">Ver Habitaciones</button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); /* full height minus navbar */
}

.map-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--color-background);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.back-arrow {
  font-size: 1.1rem;
}

.map-header h2 {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.hotel-count {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.map-fullscreen {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.hotel-floating-card {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 360px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.close-card-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.close-card-btn:hover {
  background: white;
  transform: scale(1.05);
}

.hotel-card-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hotel-card-content {
  padding: 20px;
}

.hotel-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.hotel-city, .hotel-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hotel-rating {
  color: #fbbf24;
  font-weight: 600;
}

.hotel-card-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: var(--color-text);
  line-height: 1.2;
}

.hotel-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-light);
  line-height: 1.5;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 150%);
}
</style>
