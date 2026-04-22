<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Room } from '../store/hotelStore'
import SvgIcon from './SvgIcon.vue'

const props = defineProps<{
  room: Room
}>()

const emit = defineEmits<{
  (e: 'book', roomId: string): void
  (e: 'show-details', roomId: string): void
}>()

const currentImageIndex = ref(0)

const hasMultipleImages = computed(() => props.room.images && props.room.images.length > 1)

const currentImage = computed(() => {
  if (hasMultipleImages.value && props.room.images) {
    return props.room.images[currentImageIndex.value]
  }
  return props.room.image
})

const nextImage = () => {
  if (!props.room.images) return
  currentImageIndex.value = (currentImageIndex.value + 1) % props.room.images.length
}

const prevImage = () => {
  if (!props.room.images) return
  currentImageIndex.value = (currentImageIndex.value - 1 + props.room.images.length) % props.room.images.length
}
</script>

<template>
  <div class="room-card" :class="{ 'unavailable': !room.isAvailable }" @click="emit('show-details', room.id)">
    <div class="room-image-wrapper">
      <img :src="currentImage" :alt="room.name" class="room-image" />
      
      <div v-if="hasMultipleImages" class="carousel-controls">
        <button @click.stop="prevImage" class="carousel-btn prev-btn"><SvgIcon name="chevron-left" :size="16" /></button>
        <button @click.stop="nextImage" class="carousel-btn next-btn"><SvgIcon name="chevron-right" :size="16" /></button>
      </div>
      
      <div v-if="hasMultipleImages" class="carousel-indicators">
        <span v-for="(img, idx) in room.images" :key="idx" 
              class="indicator" :class="{ active: idx === currentImageIndex }"></span>
      </div>
    </div>
    
    <div class="room-info">
      <h3>{{ room.name }}</h3>
      <p class="description">{{ room.description }}</p>
      
      <div class="room-details">
        <span class="detail-item"><SvgIcon name="bed" :size="16" /> {{ room.type }}</span>
        <span class="detail-item"><SvgIcon name="user" :size="16" /> Máx {{ room.capacity }} pers.</span>
      </div>
      
      <div v-if="room.amenities && room.amenities.length > 0" class="room-amenities">
        <span v-for="(amenity, idx) in room.amenities" :key="idx" class="amenity-chip">
          ✓ {{ amenity }}
        </span>
      </div>
      
      <div class="room-footer">
        <div class="price">
          <span class="amount">${{ room.pricePerNight }}</span>
          <span class="period">/noche</span>
        </div>
        <button 
          class="btn btn-primary" 
          :disabled="!room.isAvailable"
          @click.stop="emit('book', room.id)"
        >
          {{ room.isAvailable ? 'Reservar Ahora' : 'No Disponible' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.room-card.unavailable {
  opacity: 0.8;
}

.room-image-wrapper {
  position: relative;
  height: 200px;
}

.room-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.room-image-wrapper:hover .carousel-controls {
  opacity: 1;
}

.carousel-btn {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-sm);
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transition: background 0.3s ease;
}

.indicator.active {
  background: white;
}

.room-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.room-info h3 {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.description {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  flex: 1;
}

.room-details {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.room-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--spacing-md);
}

.amenity-chip {
  background: var(--color-background);
  color: var(--color-text-light);
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid var(--color-background);
  padding-top: var(--spacing-md);
}

.price .amount {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.price .period {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}
</style>
