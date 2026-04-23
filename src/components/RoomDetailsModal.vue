<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Room } from '../store/hotelStore'
import SvgIcon from './SvgIcon.vue'

const props = defineProps<{
  room: Room
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'book', roomId: string): void
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

const discountedPrice = computed(() => Math.floor(props.room.pricePerNight * 0.85))

const isClosing = ref(false)

const handleClose = () => {
  isClosing.value = true
  setTimeout(() => {
    emit('close')
  }, 250)
} // Fake discount logic for UI

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="modal-overlay" :class="{ closing: isClosing }" @click.self="handleClose">
    <div class="modal-container" :class="{ closing: isClosing }">
      
      <!-- Header -->
      <div class="modal-header">
        <button class="close-btn" @click="handleClose">
          <SvgIcon name="close" :size="16" />
        </button>
        <h2>Información de la unidad</h2>
      </div>

      <!-- Scrollable Content -->
      <div class="modal-content">
        
        <!-- Image Carousel -->
        <div class="image-carousel">
          <img :src="currentImage" :alt="room.name" class="main-image" />
          <div v-if="hasMultipleImages" class="carousel-controls">
            <button @click.stop="prevImage" class="carousel-btn prev-btn"><SvgIcon name="chevron-left" :size="20" /></button>
            <button @click.stop="nextImage" class="carousel-btn next-btn"><SvgIcon name="chevron-right" :size="20" /></button>
          </div>
        </div>

        <div class="info-section">
          <h1 class="room-title">{{ room.name }}</h1>

          <!-- Highlight Amenities -->
          <div v-if="room.extendedDetails?.highlightAmenities" class="highlights-grid">
            <div v-for="(highlight, idx) in room.extendedDetails.highlightAmenities" :key="idx" class="highlight-item">
              <span class="highlight-icon"><SvgIcon :name="highlight.icon" :size="28" /></span>
              <span class="highlight-text">{{ highlight.text }}</span>
            </div>
          </div>

          <!-- Space Info -->
          <div class="section-block">
            <h3>Información sobre el espacio</h3>
            <p v-if="room.extendedDetails?.spaceInfo" class="space-summary">{{ room.extendedDetails.spaceInfo }}</p>
            
            <div v-if="room.extendedDetails?.roomBreakdown" class="room-breakdown">
              <div v-for="(breakdown, idx) in room.extendedDetails.roomBreakdown" :key="idx" class="breakdown-item">
                <h4 class="breakdown-name">{{ breakdown.name }}</h4>
                <div class="bed-icon"><SvgIcon name="bed" :size="24" /></div>
                <p class="breakdown-beds">{{ breakdown.beds }}</p>
              </div>
            </div>
          </div>

          <!-- Categorized Amenities -->
          <div class="section-block">
            <h3>Amenidades en la unidad</h3>
            <div v-if="room.extendedDetails?.categorizedAmenities" class="amenities-masonry">
              <div v-for="(items, category) in room.extendedDetails.categorizedAmenities" :key="category" class="amenity-category">
                <h4>{{ category }}</h4>
                <ul class="amenity-list">
                  <li v-for="(item, idx) in items" :key="idx">• {{ item }}</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="modal-footer">
        <div class="footer-info">
          <h3>Opciones de la unidad</h3>
          <p class="refund-info">100% reembolsable <span>ⓘ</span></p>
          <p class="availability-text">{{ room.isAvailable ? '1 habitación disponible' : 'Agotada' }}</p>
        </div>
        
        <div class="footer-action">
          <div class="price-box">
            <div class="discount-badge">¡Oferta especial!</div>
            <div class="price-per-night">${{ room.pricePerNight }} por noche</div>
            <div class="price-total"><span class="strike">${{ room.pricePerNight + 50 }}</span> <strong>${{ room.pricePerNight }} en total</strong></div>
            <div class="taxes-text">Total con impuestos y cargos</div>
          </div>
          <button class="btn-reservar" :disabled="!room.isAvailable" @click="emit('book', room.id)">
            Reservar
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 24px;
  animation: overlayFadeIn 0.3s ease-out;
}

.modal-overlay.closing {
  animation: overlayFadeOut 0.25s ease-in forwards;
}

@keyframes overlayFadeIn {
  from { backdrop-filter: blur(0px); background-color: rgba(0, 0, 0, 0); }
  to { backdrop-filter: blur(12px); background-color: rgba(0, 0, 0, 0.4); }
}

@keyframes overlayFadeOut {
  from { backdrop-filter: blur(12px); background-color: rgba(0, 0, 0, 0.4); }
  to { backdrop-filter: blur(0px); background-color: rgba(0, 0, 0, 0); }
}

.modal-container {
  background: white;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-container.closing {
  animation: slideDown 0.25s ease-in forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(40px); }
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
}

.close-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 16px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.modal-content::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

.image-carousel {
  position: relative;
  height: 400px;
  width: 100%;
  background: #f5f5f5;
}

.main-image {
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
  padding: 0 24px;
}

.carousel-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.carousel-btn:hover {
  transform: scale(1.05);
}

.info-section {
  padding: 32px;
}

.room-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1a1a1a;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: #f7f9fa;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.highlight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.highlight-icon {
  font-size: 1.8rem;
}

.highlight-text {
  font-size: 0.95rem;
  color: #333;
}

.section-block {
  margin-bottom: 40px;
}

.section-block h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.space-summary {
  font-size: 1.1rem;
  color: #4a4a4a;
  margin-bottom: 24px;
}

.room-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.breakdown-item {
  min-width: 150px;
}

.breakdown-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.bed-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #666;
}

.breakdown-beds {
  font-size: 0.95rem;
  color: #4a4a4a;
}

.amenities-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.amenity-category h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.amenity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.amenity-list li {
  font-size: 0.95rem;
  color: #4a4a4a;
  margin-bottom: 8px;
  padding-left: 4px;
}

.modal-footer {
  border-top: 1px solid #eaeaea;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: white;
}

.footer-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.refund-info {
  color: #0b8043;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.availability-text {
  color: #c5221f;
  font-size: 0.9rem;
  font-weight: 500;
}

.footer-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.price-box {
  text-align: right;
}

.discount-badge {
  background: #0b8043;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 4px;
}

.price-per-night {
  font-size: 1rem;
  color: #4a4a4a;
  margin-bottom: 2px;
}

.price-total {
  font-size: 1.2rem;
}

.strike {
  text-decoration: line-through;
  color: #666;
  margin-right: 8px;
}

.price-total strong {
  font-weight: 800;
  color: #1a1a1a;
}

.taxes-text {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

.btn-reservar {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px 64px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-reservar:hover {
  background: var(--color-primary-dark);
}

.btn-reservar:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
