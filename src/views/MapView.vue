<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHotelStore } from '../store/hotelStore'
import GoogleMap from '../components/GoogleMap.vue'
import SvgIcon from '../components/SvgIcon.vue'

const router = useRouter()
const { state } = useHotelStore()

const hotels = computed(() => state.hotels)

const goBack = () => {
  router.push('/')
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
      <GoogleMap :hotels="hotels" />
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
}
</style>
