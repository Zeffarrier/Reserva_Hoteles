<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, watch, nextTick } from 'vue'
import type { Hotel } from '../store/hotelStore'

const props = defineProps<{
  hotels: Hotel[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let markers: any[] = []

// Esperar a que google.maps esté disponible
const waitForGoogle = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }
    // Revisar cada 100ms
    const interval = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })
}

const initMap = async () => {
  if (!mapContainer.value) return
  
  await waitForGoogle()

  // Límites geográficos de Panamá
  const panamaBounds = {
    north: 9.7,
    south: 7.0,
    west: -83.1,
    east: -77.1
  }

  const defaultCenter = props.hotels.length > 0
    ? { lat: props.hotels[0].lat, lng: props.hotels[0].lng }
    : { lat: 8.9824, lng: -79.5209 }

  map = new window.google.maps.Map(mapContainer.value, {
    center: defaultCenter,
    zoom: 12,
    disableDefaultUI: true,
    zoomControl: true,
    restriction: {
      latLngBounds: panamaBounds,
      strictBounds: true
    },
    minZoom: 7,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  })

  updateMarkers()
}

const clearMarkers = () => {
  markers.forEach(m => m.setMap(null))
  markers = []
}

const updateMarkers = () => {
  if (!map) return
  clearMarkers()

  const bounds = new window.google.maps.LatLngBounds()
  let hasValidCoords = false

  props.hotels.forEach(hotel => {
    if (hotel.lat && hotel.lng) {
      hasValidCoords = true
      const position = { lat: hotel.lat, lng: hotel.lng }

      const marker = new window.google.maps.Marker({
        map,
        position,
        title: hotel.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        }
      })

      // Info window al hacer click
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="font-size: 14px;">${hotel.name}</strong>
            <p style="margin: 4px 0 0; color: #666; font-size: 12px;">
              ${hotel.city} · ★ ${hotel.rating}
            </p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        map.panTo(position)
        map.setZoom(15)
      })

      markers.push(marker)
      bounds.extend(position)
    }
  })

  // Ajustar vista para mostrar todos los marcadores
  if (hasValidCoords && props.hotels.length > 1) {
    map.fitBounds(bounds)
  } else if (hasValidCoords && props.hotels.length === 1) {
    map.setCenter({ lat: props.hotels[0].lat, lng: props.hotels[0].lng })
    map.setZoom(14)
  }
}

onMounted(() => {
  initMap()
})

watch(() => props.hotels, () => {
  nextTick(() => updateMarkers())
}, { deep: true })
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
}
</style>
