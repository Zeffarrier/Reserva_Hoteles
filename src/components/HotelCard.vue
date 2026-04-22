<script setup lang="ts">
import type { Hotel } from '../store/hotelStore'
import { useRouter } from 'vue-router'
import SvgIcon from './SvgIcon.vue'

const props = defineProps<{
  hotel: Hotel
}>()

const router = useRouter()

const viewDetails = () => {
  router.push(`/hotel/${props.hotel.id}`)
}
</script>

<template>
  <div class="hotel-card" @click="viewDetails">
    <div class="hotel-image-wrapper">
      <img :src="hotel.image" :alt="hotel.name" class="hotel-image" />
      <div class="city-badge">{{ hotel.city }}</div>
    </div>
    
    <div class="hotel-info">
      <h3>{{ hotel.name }}</h3>
      
      <div class="rating">
        <span class="star"><SvgIcon name="star" :size="16" /></span>
        <span>{{ hotel.rating }} / 5</span>
      </div>
      
      <p class="description">{{ hotel.description }}</p>
      
      <div class="hotel-footer">
        <button class="btn btn-secondary btn-block" @click.stop="viewDetails">
          Ver Habitaciones
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hotel-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.hotel-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.hotel-image-wrapper {
  position: relative;
  height: 200px;
}

.hotel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-badge {
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.hotel-info {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.hotel-info h3 {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.star {
  color: var(--color-warning);
}

.description {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hotel-footer {
  margin-top: auto;
}

.btn-block {
  width: 100%;
}
</style>
