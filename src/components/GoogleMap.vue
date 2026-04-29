<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Hotel } from '../types/models'

const props = defineProps<{
  hotels: Hotel[]
}>()

const emit = defineEmits<{
  (e: 'hotel-clicked', hotel: Hotel): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersGroup: L.FeatureGroup | null = null

const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-hotel-marker',
    html: `
      <div class="marker-shadow"></div>
      <div class="marker-pin">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21h18"/>
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
          <path d="M9 21v-4h6v4"/>
          <path d="M10 9h4"/>
          <path d="M10 13h4"/>
        </svg>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48]
  })
}

const initMap = () => {
  if (!mapContainer.value) return

  const defaultCenter: L.LatLngTuple = props.hotels.length > 0
    ? [props.hotels[0].lat, props.hotels[0].lng]
    : [8.9824, -79.5209]

  // Límites geográficos de Panamá
  const panamaBounds = L.latLngBounds(
    L.latLng(7.0, -83.1), // Suroeste
    L.latLng(9.7, -77.1)  // Noreste
  )

  map = L.map(mapContainer.value, {
    maxBounds: panamaBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 7
  }).setView(defaultCenter, 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markersGroup = L.featureGroup().addTo(map)

  updateMarkers()
}

const updateMarkers = () => {
  if (!map || !markersGroup) return
  
  markersGroup.clearLayers()

  let hasValidCoords = false
  const customIcon = createCustomIcon()

  props.hotels.forEach(hotel => {
    if (hotel.lat && hotel.lng) {
      hasValidCoords = true
      const marker = L.marker([hotel.lat, hotel.lng], { icon: customIcon })
      
      marker.on('click', () => {
        emit('hotel-clicked', hotel)
        map?.panTo([hotel.lat, hotel.lng])
      })
      
      markersGroup!.addLayer(marker)
    }
  })

  if (hasValidCoords && props.hotels.length > 0) {
    map.fitBounds(markersGroup.getBounds(), { padding: [50, 50], maxZoom: 14 })
  }
}

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 100)
})

watch(() => props.hotels, () => {
  nextTick(() => updateMarkers())
}, { deep: true })

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<template>
  <div class="map-wrapper" ref="mapContainer"></div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  min-height: 400px;
  z-index: 1; /* prevent overlapping floating elements */
}

/* Custom Leaflet Marker Styles */
:deep(.custom-hotel-marker) {
  background: transparent;
  border: none;
}

:deep(.marker-pin) {
  width: 36px;
  height: 36px;
  background-color: var(--color-primary);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  position: absolute;
  top: 0;
  left: 2px;
  border: 2px solid white;
  z-index: 2;
}

:deep(.marker-pin svg) {
  transform: rotate(45deg);
  color: white;
}

:deep(.marker-shadow) {
  width: 20px;
  height: 6px;
  background-color: rgba(0,0,0,0.5);
  border-radius: 50%;
  position: absolute;
  bottom: 0px;
  left: 10px;
  filter: blur(2px);
  z-index: 1;
}
</style>
