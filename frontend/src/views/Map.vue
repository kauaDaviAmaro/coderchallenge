<script setup>
import '../assets/css/map.css'
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { primordialDucks } from '../stores/ducks.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

const mapContainer = ref(null)
let map = null
const mapPoints = ref([])
const selectedPoint = ref(null)
const showPrecisionCircles = ref(true)
const precisionCircles = ref([])

// Fix for default Leaflet markers
const icon = L.Icon.Default.prototype
delete icon._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const createMapPoints = () => {
  if (primordialDucks.value.length === 0) {
    // Create test points if no data
    mapPoints.value = [
      { id: 1, name: 'Teste 1', lat: -23.550, lng: -46.633, duck: { hibernating: false, type: 'Common', knowledge: 50 }, type: 'active' },
      { id: 2, name: 'Teste 2', lat: -23.555, lng: -46.640, duck: { hibernating: true, type: 'Rare', knowledge: 70 }, type: 'hibernating' },
      { id: 3, name: 'Teste 3', lat: -23.545, lng: -46.620, duck: { hibernating: false, type: 'Epic', knowledge: 90 }, type: 'active' }
    ]
  } else {
    mapPoints.value = primordialDucks.value.map((duck, index) => {
      const isHibernating = duck.status === 'deep-hibernation' || duck.status === 'trance'
      
      return {
        id: duck.id,
        name: duck.name || `Pato ${index + 1}`,
        lat: duck.location?.gps?.lat || -23.550,
        lng: duck.location?.gps?.lon || -46.633,
        duck: duck,
        type: isHibernating ? 'hibernating' : 'active'
      }
    })
  }
}

onMounted(async () => {
  console.log('Map mounted, ducks:', primordialDucks.value.length)
  createMapPoints()
  
  await nextTick()
  
  if (mapContainer.value) {
    // Initialize map centered on São Paulo, Brazil
    map = L.map(mapContainer.value, {
      center: [-23.550, -46.633],
      zoom: 10,
      zoomControl: true,
    })
    
    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map)
    
    const markers = []
    
    // Add markers for each point
    mapPoints.value.forEach(point => {
      const color = point.type === 'active' ? '#dc2626' : '#3b82f6'
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
      
      const statusText = {
        'awake': 'Desperto',
        'trance': 'Transe',
        'deep-hibernation': 'Hibernação Profunda'
      }[point.duck.status] || point.duck.status
      
      const precisionText = point.duck.location?.precision 
        ? `${(point.duck.location.precision / 100).toFixed(2)} m`
        : 'N/A'
      
      const marker = L.marker([point.lat, point.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: ${color};">${point.name}</h3>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${statusText}</p>
            <p style="margin: 4px 0;"><strong>Cidade:</strong> ${point.duck.location?.city || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Precisão GPS:</strong> ${precisionText}</p>
            <p style="margin: 4px 0;"><strong>Mutações:</strong> ${point.duck.mutations || 0}</p>
          </div>
        `)
      
      marker.on('click', () => {
        selectedPoint.value = point
      })
      
      markers.push(marker)
      
      // Add precision circle if precision data exists
      if (showPrecisionCircles.value && point.duck.location?.precision) {
        // Convert precision from cm to meters
        const precisionRadius = point.duck.location.precision / 100
        
        const circle = L.circle([point.lat, point.lng], {
          radius: precisionRadius,
          fillColor: color,
          fillOpacity: 0.15,
          color: color,
          weight: 2,
          opacity: 0.5,
          stroke: true
        }).addTo(map)
        
        precisionCircles.value.push(circle)
      }
    })
    
    // Fit map to show all markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.2))
    }
    
    console.log('Map initialized with', mapPoints.value.length, 'points')
  }
})

const handlePointClick = (point) => {
  selectedPoint.value = point
}

const goToCatalog = () => {
  router.push('/catalog')
}

// Watch for changes in showPrecisionCircles to update the map
watch(showPrecisionCircles, (newValue) => {
  if (!map || !precisionCircles.value.length) return
  
  precisionCircles.value.forEach(circle => {
    if (newValue) {
      if (!map.hasLayer(circle)) {
        circle.addTo(map)
      }
    } else {
      if (map.hasLayer(circle)) {
        circle.remove()
      }
    }
  })
})

</script>

<template>
  <div class="map-container">
    <div class="map-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="map-title">
            <svg class="title-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Mapa de Distribuição
          </h1>
          <p class="map-subtitle">Visualização da localização dos patos</p>
        </div>
        <div class="map-controls">
          <button @click="showPrecisionCircles = !showPrecisionCircles" 
                  class="control-button"
                  :class="{ active: showPrecisionCircles }">
            <svg class="control-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Círculos de Precisão
          </button>
        </div>
      </div>
    </div>

    <div class="map-content">
      <div class="map-view">
        <div ref="mapContainer" class="map-leaflet"></div>
      </div>

      <div class="map-stats">
        <div class="stat-card">
          <div class="stat-header">
            <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
            </svg>
            <h3>Total de Patos</h3>
          </div>
          <p class="stat-value">{{ mapPoints.length }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            <h3>Patos Ativos</h3>
          </div>
          <p class="stat-value active">{{ mapPoints.filter(p => p.type === 'active').length }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            <h3>Patos Hibernando</h3>
          </div>
          <p class="stat-value hibernating">{{ mapPoints.filter(p => p.type === 'hibernating').length }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Global styles for Leaflet - Dark Theme */
.map-leaflet .leaflet-container {
    background: #0a0a0a !important;
}

.map-leaflet .leaflet-tile-pane {
    filter: brightness(0.8) contrast(1.2) !important;
}

.map-leaflet .leaflet-popup-content-wrapper {
    background: #1a1a1a !important;
    border: 2px solid rgba(220, 38, 38, 0.6) !important;
    border-radius: 8px !important;
    color: #e5e5e5 !important;
    box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3) !important;
}

.map-leaflet .leaflet-popup-tip {
    background: #1a1a1a !important;
    border: 2px solid rgba(220, 38, 38, 0.6) !important;
}

.map-leaflet .leaflet-popup-content {
    color: #e5e5e5 !important;
}

.map-leaflet .leaflet-popup-close-button {
    color: #dc2626 !important;
}

.map-leaflet .leaflet-control-zoom {
    border: 2px solid rgba(220, 38, 38, 0.6) !important;
    background: #1a1a1a !important;
}

.map-leaflet .leaflet-control-zoom a {
    background: #1a1a1a !important;
    color: #dc2626 !important;
    border: 1px solid rgba(220, 38, 38, 0.4) !important;
}

.map-leaflet .leaflet-control-zoom a:hover {
    background: rgba(220, 38, 38, 0.3) !important;
    color: #ff4444 !important;
}
</style>
