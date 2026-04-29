<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Room } from '../types/models'
import SvgIcon from './SvgIcon.vue'

const props = defineProps<{
  room: Room
}>()

const emit = defineEmits<{
  (e: 'book', roomId: string): void
  (e: 'show-details', roomId: string): void
}>()

const currentImageIndex = ref(0)
const roomImages = computed(() => (props.room as any).images || [])
const hasMultipleImages = computed(() => roomImages.value.length > 1)

const currentImage = computed(() => {
  if (hasMultipleImages.value) {
    return roomImages.value[currentImageIndex.value]
  }
  return (props.room as any).image || 'https://placehold.co/600x400?text=Habitacion'
})

const nextImage = () => {
  if (!hasMultipleImages.value) return
  currentImageIndex.value = (currentImageIndex.value + 1) % roomImages.value.length
}

const prevImage = () => {
  if (!hasMultipleImages.value) return
  currentImageIndex.value = (currentImageIndex.value - 1 + roomImages.value.length) % roomImages.value.length
}

const isAvailable = computed(() => props.room.quantity > 0)
</script>

<template>
  <div class="room-card" :class="{ 'unavailable': !isAvailable }" @click="emit('show-details', room.id)">
    <div class="room-image-wrapper">
      <img :src="currentImage" :alt="room.name" class="room-image" />
      
      <div v-if="hasMultipleImages" class="carousel-controls">
        <button @click.stop="prevImage" class="carousel-btn prev-btn"><SvgIcon name="chevron-left" :size="16" /></button>
        <button @click.stop="nextImage" class="carousel-btn next-btn"><SvgIcon name="chevron-right" :size="16" /></button>
      </div>
      
      <div v-if="hasMultipleImages" class="carousel-indicators">
        <span v-for="(_, idx) in roomImages" :key="idx" 
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
      
      <div v-if="room.highlighted_amenities && room.highlighted_amenities.length > 0" class="room-amenities">
        <span v-for="(amenity, idx) in room.highlighted_amenities" :key="idx" class="amenity-chip">
          <SvgIcon :name="amenity.icon" :size="12" style="margin-right: 4px;" v-if="amenity.icon"/> {{ amenity.text }}
        </span>
      </div>
      
      <div class="room-footer">
        <div class="price">
          <span class="amount">${{ room.price }}</span>
          <span class="period">/noche</span>
        </div>
        <button 
          class="btn btn-primary" 
          :disabled="!isAvailable"
          @click.stop="emit('book', room.id)"
        >
          {{ isAvailable ? 'Reservar Ahora' : 'Agotada' }}
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
