<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const props = defineProps<{
  lat: number
  lng: number
}>()

const emit = defineEmits<{
  (e: 'update:lat', val: number): void
  (e: 'update:lng', val: number): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

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
    iconAnchor: [20, 48]
  })
}

const panamaBounds = L.latLngBounds(
  L.latLng(7.0, -83.1),
  L.latLng(9.7, -77.1)
)

const initMap = () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    maxBounds: panamaBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 6
  }).setView([props.lat, props.lng], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  const customIcon = createCustomIcon()
  marker = L.marker([props.lat, props.lng], { icon: customIcon, draggable: true }).addTo(map)

  // Update on drag
  marker.on('dragend', (e) => {
    const position = e.target.getLatLng()
    emit('update:lat', Number(position.lat.toFixed(6)))
    emit('update:lng', Number(position.lng.toFixed(6)))
  })

  // Update on click
  map.on('click', (e: L.LeafletMouseEvent) => {
    const position = e.latlng
    marker?.setLatLng(position)
    emit('update:lat', Number(position.lat.toFixed(6)))
    emit('update:lng', Number(position.lng.toFixed(6)))
  })
}

onMounted(() => {
  setTimeout(() => {
    initMap()
    // Forzar recalcular tamaño del mapa después de que se termine la animación del panel
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 400)
  }, 200)
})

watch(() => [props.lat, props.lng], ([newLat, newLng]) => {
  if (marker && newLat && newLng) {
    const currentLatLng = marker.getLatLng()
    if (Math.abs(currentLatLng.lat - newLat) > 0.000001 || Math.abs(currentLatLng.lng - newLng) > 0.000001) {
      marker.setLatLng([newLat, newLng])
      map?.panTo([newLat, newLng])
    }
  }
})

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
  height: 250px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(0,0,0,0.1);
  z-index: 1;
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
  cursor: grab;
}

:deep(.marker-pin:active) {
  cursor: grabbing;
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
