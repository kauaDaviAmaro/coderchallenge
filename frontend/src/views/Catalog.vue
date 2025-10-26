<script setup>
import '../assets/css/catalog.css'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { primordialDucks, loadDucks, deleteDuck, updateDuck, addDuck, calculateOperationalCost, calculateRiskLevel, unitConverters } from '../stores/ducks.js'

const router = useRouter()
const ducks = ref([])
const selectedDuck = ref(null)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const duckToDelete = ref(null)
const isLoading = ref(false)
const showCreateModal = ref(false)

// Filter states
const filters = ref({
  search: '',
  status: '',
  country: '',
  hasSuperpower: '',
  droneBrand: ''
})

onMounted(async () => {
  isLoading.value = true
  await loadDucks()
  ducks.value = primordialDucks.value
  isLoading.value = false
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatWeight = (weight) => {
  if (!weight) return '-'
  return `${(weight / 1000).toFixed(2)} kg`
}

const formatHeight = (height) => {
  if (!height) return '-'
  return `${height.toFixed(1)} cm`
}

const getStatusBadge = (status) => {
  const statuses = {
    'awake': { label: 'Acordado', color: '#ef4444' },
    'trance': { label: 'Transe', color: '#f59e0b' },
    'deep-hibernation': { label: 'Hibernação Profunda', color: '#10b981' }
  }
  return statuses[status] || { label: status, color: '#6b7280' }
}

const viewDuck = (duck) => {
  selectedDuck.value = duck
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDuck.value = null
}

const confirmDelete = (duck) => {
  duckToDelete.value = duck
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  duckToDelete.value = null
}

const handleDelete = async () => {
  if (duckToDelete.value) {
    isLoading.value = true
    await deleteDuck(duckToDelete.value.id)
    ducks.value = primordialDucks.value
    isLoading.value = false
    showDeleteConfirm.value = false
    duckToDelete.value = null
  }
}

const showEditModal = ref(false)
const duckToEdit = ref(null)

const editDuck = (duck) => {
  // Deep clone para evitar mutação do objeto original
  duckToEdit.value = {
    ...duck,
    drone: { ...duck.drone },
    location: {
      ...duck.location,
      gps: { ...duck.location.gps }
    },
    superpower: duck.superpower ? {
      ...duck.superpower,
      classification: { ...duck.superpower.classification }
    } : null
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  duckToEdit.value = null
}

const saveEdit = async () => {
  if (!duckToEdit.value) return
  
  isLoading.value = true
  try {
    console.log('Salvando pato:', duckToEdit.value.id)
    console.log('Dados a enviar:', duckToEdit.value)
    
    await updateDuck(duckToEdit.value.id, duckToEdit.value)
    
    console.log('Pato salvo com sucesso!')
    
    // Recarregar os dados da API
    await loadDucks()
    ducks.value = primordialDucks.value
    
    showEditModal.value = false
    duckToEdit.value = null
  } catch (error) {
    console.error('Erro ao editar pato:', error)
    alert('Erro ao salvar alterações: ' + error.message)
  }
  isLoading.value = false
}

const addSuperpower = () => {
  if (!duckToEdit.value.superpower) {
    duckToEdit.value.superpower = {
      name: '',
      description: '',
      classification: {
        type: '',
        rarity: 'common',
        risk: 0
      }
    }
  }
}

const newDuck = ref(null)
const measurementUnits = ref({
  heightUnit: 'cm',
  weightUnit: 'g',
  precisionUnit: 'cm'
})

const createNewDuck = () => {
  newDuck.value = {
    drone: {
      serial: '',
      brand: '',
      manufacturer: '',
      country: ''
    },
    height: 0,
    weight: 0,
    location: {
      city: '',
      country: '',
      gps: {
        lat: 0,
        lon: 0
      },
      precision: 0,
      referencePoint: ''
    },
    status: 'awake',
    heartRate: 0,
    mutations: 0,
    superpower: null
  }
  measurementUnits.value = {
    heightUnit: 'cm',
    weightUnit: 'g',
    precisionUnit: 'cm'
  }
  showCreateModal.value = true
}

const updateMeasurementUnits = () => {
  if (!newDuck.value?.drone?.country) return
  
  const isUSA = newDuck.value.drone.country.toUpperCase() === 'USA' || 
                newDuck.value.drone.country.toUpperCase() === 'UNITED STATES' ||
                newDuck.value.drone.country.toUpperCase() === 'US'
  
  if (isUSA) {
    measurementUnits.value.heightUnit = 'ft'
    measurementUnits.value.weightUnit = 'lb'
    measurementUnits.value.precisionUnit = 'yd'
  } else {
    measurementUnits.value.heightUnit = 'cm'
    measurementUnits.value.weightUnit = 'g'
    measurementUnits.value.precisionUnit = 'cm'
  }
}

const convertHeightToCm = (height, unit) => {
  if (unit === 'ft') {
    // Assume input is in feet and convert to cm
    return height * 30.48
  }
  return height
}

const convertWeightToGram = (weight, unit) => {
  if (unit === 'lb') {
    return weight * 453.592
  }
  return weight
}

const convertPrecisionToCm = (precision, unit) => {
  if (unit === 'yd') {
    return precision * 91.44
  }
  return precision
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newDuck.value = null
}

const saveNewDuck = async () => {
  if (!newDuck.value) return
  
  // Validate required fields
  if (!newDuck.value.drone?.serial || !newDuck.value.drone?.brand || 
      !newDuck.value.drone?.manufacturer || !newDuck.value.drone?.country) {
    alert('Por favor, preencha todos os campos obrigatórios do drone.')
    return
  }
  
  if (!newDuck.value.location?.city || !newDuck.value.location?.country) {
    alert('Por favor, preencha a cidade e o país.')
    return
  }
  
  if (!newDuck.value.location?.gps?.lat || !newDuck.value.location?.gps?.lon) {
    alert('Por favor, preencha as coordenadas GPS.')
    return
  }
  
  if (!newDuck.value.height || !newDuck.value.weight || newDuck.value.height <= 0 || newDuck.value.weight <= 0) {
    alert('Por favor, preencha altura e peso válidos.')
    return
  }
  
  isLoading.value = true
  try {
    // Convert measurements to metric before saving
    const duckToSave = {
      ...newDuck.value,
      height: convertHeightToCm(newDuck.value.height, measurementUnits.value.heightUnit),
      weight: convertWeightToGram(newDuck.value.weight, measurementUnits.value.weightUnit),
      location: {
        ...newDuck.value.location,
        precision: convertPrecisionToCm(newDuck.value.location.precision, measurementUnits.value.precisionUnit)
      }
    }
    
    console.log('Criando novo pato:', duckToSave)
    console.log('Unidades usadas:', measurementUnits.value)
    
    await addDuck(duckToSave)
    
    console.log('Pato criado com sucesso!')
    
    // Recarregar os dados da API
    await loadDucks()
    ducks.value = primordialDucks.value
    
    showCreateModal.value = false
    newDuck.value = null
  } catch (error) {
    console.error('Erro ao criar pato:', error)
    alert('Erro ao criar pato: ' + error.message)
  }
  isLoading.value = false
}

const addSuperpowerToNew = () => {
  if (!newDuck.value.superpower) {
    newDuck.value.superpower = {
      name: '',
      description: '',
      classification: {
        type: '',
        rarity: 'common',
        risk: 0
      }
    }
  }
}

const getSuperpowerBadge = (superpower) => {
  if (!superpower) return null
  const rarityColors = {
    'common': '#6b7280',
    'uncommon': '#22c55e',
    'rare': '#3b82f6',
    'epic': '#a855f7',
    'legendary': '#f59e0b'
  }
  return {
    name: superpower.name,
    rarity: superpower.classification?.rarity || 'common',
    color: rarityColors[superpower.classification?.rarity] || '#6b7280'
  }
}

const filteredDucks = computed(() => {
  let filtered = [...ducks.value]
  
  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(duck => 
      duck.id.toString().includes(search) ||
      duck.drone?.serial?.toLowerCase().includes(search) ||
      duck.location?.city?.toLowerCase().includes(search) ||
      duck.location?.country?.toLowerCase().includes(search) ||
      duck.drone?.brand?.toLowerCase().includes(search) ||
      duck.drone?.manufacturer?.toLowerCase().includes(search)
    )
  }
  
  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(duck => duck.status === filters.value.status)
  }
  
  // Country filter
  if (filters.value.country) {
    filtered = filtered.filter(duck => duck.location?.country === filters.value.country)
  }
  
  // Has superpower filter
  if (filters.value.hasSuperpower !== '') {
    const hasSuperpower = filters.value.hasSuperpower === 'yes'
    filtered = filtered.filter(duck => hasSuperpower ? !!duck.superpower : !duck.superpower)
  }
  
  // Drone brand filter
  if (filters.value.droneBrand) {
    filtered = filtered.filter(duck => duck.drone?.brand === filters.value.droneBrand)
  }
  
  return filtered
})

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    country: '',
    hasSuperpower: '',
    droneBrand: ''
  }
}

const availableCountries = computed(() => {
  return [...new Set(ducks.value.map(duck => duck.location?.country).filter(Boolean))].sort()
})

const availableDroneBrands = computed(() => {
  return [...new Set(ducks.value.map(duck => duck.drone?.brand).filter(Boolean))].sort()
})
</script>

<template>
  <div class="catalog-container">
    <div class="grid-overlay"></div>
    
    <div class="analysis-header">
      <h1 class="mission-title">1ª MISSÃO - CATÁLOGO</h1>
      <p class="mission-subtitle">Operação Visão de Captura - Catalogação de Patos Primordiais</p>
    </div>
    
    <div class="catalog-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="4" width="16" height="16" rx="2"/>
            <path d="M9 8h6M9 12h6M9 16h4"/>
          </svg>
          <span>Catálogo de Patos</span>
        </h1>
        <button @click="createNewDuck" class="btn-create-duck">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Novo Pato</span>
        </button>
          <div class="header-stats">
          <div class="stat-box">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ filteredDucks.length }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Acordados:</span>
            <span class="stat-value stat-danger">{{ filteredDucks.filter(d => d.status === 'awake').length }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Em Transe:</span>
            <span class="stat-value">{{ filteredDucks.filter(d => d.status === 'trance').length }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Em Hibernação:</span>
            <span class="stat-value stat-success">{{ filteredDucks.filter(d => d.status === 'deep-hibernation').length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filters-container">
        <div class="filter-group">
          <label class="filter-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Buscar:
          </label>
          <input 
            v-model="filters.search" 
            type="text" 
            class="filter-input" 
            placeholder="ID, Serial, Cidade, País..."
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Status:</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Todos</option>
            <option value="awake">Acordado</option>
            <option value="trance">Transe</option>
            <option value="deep-hibernation">Hibernação Profunda</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">País:</label>
          <select v-model="filters.country" class="filter-select">
            <option value="">Todos</option>
            <option v-for="country in availableCountries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Superpoder:</label>
          <select v-model="filters.hasSuperpower" class="filter-select">
            <option value="">Todos</option>
            <option value="yes">Com Superpoder</option>
            <option value="no">Sem Superpoder</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Marca do Drone:</label>
          <select v-model="filters.droneBrand" class="filter-select">
            <option value="">Todas</option>
            <option v-for="brand in availableDroneBrands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
        </div>

        <button @click="clearFilters" class="filter-clear-btn" v-if="filters.search || filters.status || filters.country || filters.hasSuperpower || filters.droneBrand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Limpar Filtros
        </button>
      </div>
    </div>

    <div class="catalog-content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando patos...</p>
      </div>

      <div v-else-if="ducks.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        <h2>Nenhum pato catalogado</h2>
        <p>Comece catalogando um pato para ver ele aqui.</p>
      </div>

      <div v-else-if="filteredDucks.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        <h2>Nenhum pato encontrado</h2>
        <p>Nenhum pato corresponde aos filtros selecionados.</p>
      </div>

      <div v-else class="ducks-grid">
        <div v-for="duck in filteredDucks" :key="duck.id" class="duck-card">
          <div class="card-header">
            <div class="duck-id">
              <span class="id-label">ID:</span>
              <span class="id-value">{{ duck.id }}</span>
            </div>
            <div :class="['status-badge', `status-${duck.status}`]">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusBadge(duck.status).label }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="duck-info">
              <div class="info-row">
                <span class="info-label">Drone:</span>
                <span class="info-value">{{ duck.drone?.serial || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Localização:</span>
                <span class="info-value">{{ duck.location?.city }}, {{ duck.location?.country }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tamanho:</span>
                <span class="info-value">{{ formatHeight(duck.height) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Peso:</span>
                <span class="info-value">{{ formatWeight(duck.weight) }}</span>
              </div>
              <div class="info-row" v-if="duck.mutations && duck.mutations > 0">
                <span class="info-label">Mutações:</span>
                <span class="info-value mutations">{{ duck.mutations }}</span>
              </div>
            </div>

            <div v-if="getSuperpowerBadge(duck.superpower)" class="superpower-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
              <span class="tag-text">{{ getSuperpowerBadge(duck.superpower).name }}</span>
              <span 
                class="tag-rarity"
                :style="{ color: getSuperpowerBadge(duck.superpower).color }"
              >
                {{ getSuperpowerBadge(duck.superpower).rarity }}
              </span>
            </div>
          </div>

          <div class="card-footer">
            <div class="footer-stats">
              <div class="stat-item">
                <span class="stat-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </span>
                <span class="stat-text">${{ calculateOperationalCost(duck).toFixed(0) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 22h20L12 2zm0 3.99L18.53 20H5.47L12 5.99z"/>
                    <path d="M11 16h2v2h-2zm0-6h2v4h-2z"/>
                  </svg>
                </span>
                <span class="stat-text">{{ calculateRiskLevel(duck) }}%</span>
              </div>
            </div>
            <div class="card-actions">
              <button @click="viewDuck(duck)" class="action-btn view-btn" title="Visualizar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button @click="editDuck(duck)" class="action-btn edit-btn" title="Editar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button @click="confirmDelete(duck)" class="action-btn delete-btn" title="Deletar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalhes do Pato</h2>
          <button @click="closeModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedDuck">
          <div class="detail-section">
            <h3>Informações do Drone</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Serial:</span>
                <span class="detail-value">{{ selectedDuck.drone?.serial }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Marca:</span>
                <span class="detail-value">{{ selectedDuck.drone?.brand }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fabricante:</span>
                <span class="detail-value">{{ selectedDuck.drone?.manufacturer }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ selectedDuck.drone?.country }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Medidas Físicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Altura:</span>
                <span class="detail-value">{{ formatHeight(selectedDuck.height) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Peso:</span>
                <span class="detail-value">{{ formatWeight(selectedDuck.weight) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Localização</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Cidade:</span>
                <span class="detail-value">{{ selectedDuck.location?.city }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ selectedDuck.location?.country }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">GPS:</span>
                <span class="detail-value">{{ selectedDuck.location?.gps?.lat }}, {{ selectedDuck.location?.gps?.lon }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Precisão:</span>
                <span class="detail-value">{{ selectedDuck.location?.precision }}cm</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Status</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Estado de Hibernação:</span>
                <span class="detail-value">{{ getStatusBadge(selectedDuck.status).label }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Frequência Cardíaca:</span>
                <span class="detail-value">{{ selectedDuck.heartRate || '-' }} bpm</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Mutações:</span>
                <span class="detail-value">{{ selectedDuck.mutations || 0 }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedDuck.superpower" class="detail-section">
            <h3>Superpoder</h3>
            <div class="superpower-details">
              <div class="detail-item full-width">
                <span class="detail-label">Nome:</span>
                <span class="detail-value">{{ selectedDuck.superpower.name }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Descrição:</span>
                <span class="detail-value">{{ selectedDuck.superpower.description }}</span>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Tipo:</span>
                  <span class="detail-value">{{ selectedDuck.superpower?.classification?.type || selectedDuck.superpowerType }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Raridade:</span>
                  <span class="detail-value">{{ selectedDuck.superpower?.classification?.rarity || selectedDuck.superpowerRarity }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Risco:</span>
                  <span class="detail-value">{{ selectedDuck.superpower?.classification?.risk || selectedDuck.superpowerRisk || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Análise Operacional</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Custo Operacional:</span>
                <span class="detail-value">${{ calculateOperationalCost(selectedDuck).toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Nível de Risco:</span>
                <span class="detail-value">{{ calculateRiskLevel(selectedDuck) }}%</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Datas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Registrado em:</span>
                <span class="detail-value">{{ formatDate(selectedDuck.registeredAt) }}</span>
              </div>
              <div class="detail-item" v-if="selectedDuck.isCaptured">
                <span class="detail-label">Capturado em:</span>
                <span class="detail-value">{{ formatDate(selectedDuck.capturedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="editDuck(selectedDuck)" class="modal-btn primary-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button @click="closeModal" class="modal-btn secondary-btn">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content small-modal" @click.stop>
        <div class="modal-header">
          <h2>Confirmar Exclusão</h2>
          <button @click="cancelDelete" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <p>Tem certeza que deseja excluir o pato <strong>ID {{ duckToDelete?.id }}</strong>?</p>
          <p class="warning-text">Esta ação não pode ser desfeita.</p>
        </div>

        <div class="modal-footer">
          <button @click="handleDelete" class="modal-btn danger-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
            Excluir
          </button>
          <button @click="cancelDelete" class="modal-btn secondary-btn">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal && duckToEdit" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal-content" @click.stop>
        <div class="modal-header">
          <h2>Editar Pato</h2>
          <button @click="closeEditModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body edit-form">
          <div class="detail-section">
            <h3>Informações do Drone</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Serial:</span>
                <input v-model="duckToEdit.drone.serial" class="form-input-small" placeholder="Serial do drone">
              </div>
              <div class="detail-item">
                <span class="detail-label">Marca:</span>
                <input v-model="duckToEdit.drone.brand" class="form-input-small" placeholder="Marca">
              </div>
              <div class="detail-item">
                <span class="detail-label">Fabricante:</span>
                <input v-model="duckToEdit.drone.manufacturer" class="form-input-small" placeholder="Fabricante">
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <input v-model="duckToEdit.drone.country" class="form-input-small" placeholder="País">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Medidas Físicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Altura (cm):</span>
                <input v-model.number="duckToEdit.height" type="number" step="0.1" class="form-input-small" placeholder="Altura em cm">
              </div>
              <div class="detail-item">
                <span class="detail-label">Peso (g):</span>
                <input v-model.number="duckToEdit.weight" type="number" step="0.1" class="form-input-small" placeholder="Peso em gramas">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Localização</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Cidade:</span>
                <input v-model="duckToEdit.location.city" class="form-input-small" placeholder="Cidade">
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <input v-model="duckToEdit.location.country" class="form-input-small" placeholder="País">
              </div>
              <div class="detail-item">
                <span class="detail-label">Latitude:</span>
                <input v-model.number="duckToEdit.location.gps.lat" type="number" step="0.000001" class="form-input-small" placeholder="Latitude">
              </div>
              <div class="detail-item">
                <span class="detail-label">Longitude:</span>
                <input v-model.number="duckToEdit.location.gps.lon" type="number" step="0.000001" class="form-input-small" placeholder="Longitude">
              </div>
              <div class="detail-item">
                <span class="detail-label">Precisão (cm):</span>
                <input v-model.number="duckToEdit.location.precision" type="number" class="form-input-small" placeholder="Precisão">
              </div>
              <div class="detail-item">
                <span class="detail-label">Ponto de Referência:</span>
                <input v-model="duckToEdit.location.referencePoint" class="form-input-small" placeholder="Ponto de referência">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Status</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Estado de Hibernação:</span>
                <select v-model="duckToEdit.status" class="form-input-small">
                  <option value="awake">Acordado</option>
                  <option value="trance">Transe</option>
                  <option value="deep-hibernation">Hibernação Profunda</option>
                </select>
              </div>
              <div class="detail-item">
                <span class="detail-label">Frequência Cardíaca (bpm):</span>
                <input v-model.number="duckToEdit.heartRate" type="number" class="form-input-small" placeholder="BPM">
              </div>
              <div class="detail-item">
                <span class="detail-label">Mutações:</span>
                <input v-model.number="duckToEdit.mutations" type="number" class="form-input-small" placeholder="Número de mutações">
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="duckToEdit.superpower">
            <h3>Superpoder</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Nome:</span>
                <input v-model="duckToEdit.superpower.name" class="form-input-small" placeholder="Nome do superpoder">
              </div>
              <div class="detail-item">
                <span class="detail-label">Tipo:</span>
                <input v-model="duckToEdit.superpower.classification.type" class="form-input-small" placeholder="Tipo">
              </div>
              <div class="detail-item">
                <span class="detail-label">Raridade:</span>
                <select v-model="duckToEdit.superpower.classification.rarity" class="form-input-small">
                  <option value="common">Comum</option>
                  <option value="uncommon">Incomum</option>
                  <option value="rare">Raro</option>
                  <option value="epic">Épico</option>
                  <option value="legendary">Lendário</option>
                </select>
              </div>
              <div class="detail-item">
                <span class="detail-label">Risco (%):</span>
                <input v-model.number="duckToEdit.superpower.classification.risk" type="number" min="0" max="100" class="form-input-small" placeholder="0-100">
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Descrição:</span>
                <textarea v-model="duckToEdit.superpower.description" class="form-textarea" placeholder="Descrição do superpoder" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="detail-section" v-else>
            <h3>Adicionar Superpoder</h3>
            <button @click="addSuperpower" class="btn-add-superpower">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Adicionar Superpoder
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="saveEdit" class="modal-btn primary-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Salvar
          </button>
          <button @click="closeEditModal" class="modal-btn secondary-btn">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal && newDuck" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content edit-modal-content" @click.stop>
        <div class="modal-header">
          <h2>Criar Novo Pato</h2>
          <button @click="closeCreateModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body edit-form">
          <div class="detail-section">
            <h3>Informações do Drone</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Serial:</span>
                <input v-model="newDuck.drone.serial" class="form-input-small" placeholder="Serial do drone" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Marca:</span>
                <input v-model="newDuck.drone.brand" class="form-input-small" placeholder="Marca" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fabricante:</span>
                <input v-model="newDuck.drone.manufacturer" class="form-input-small" placeholder="Fabricante" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <input v-model="newDuck.drone.country" @input="updateMeasurementUnits" class="form-input-small" placeholder="País" required>
                <small class="unit-hint">Digite USA para usar unidades americanas (pés, libras, jardas)</small>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Medidas Físicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Altura ({{ measurementUnits.heightUnit }}):</span>
                <input v-model.number="newDuck.height" type="number" step="0.1" class="form-input-small" :placeholder="`Altura em ${measurementUnits.heightUnit}`" required>
                <small v-if="measurementUnits.heightUnit === 'ft'" class="unit-hint">Será automaticamente convertido para cm</small>
              </div>
              <div class="detail-item">
                <span class="detail-label">Peso ({{ measurementUnits.weightUnit }}):</span>
                <input v-model.number="newDuck.weight" type="number" step="0.1" class="form-input-small" :placeholder="`Peso em ${measurementUnits.weightUnit}`" required>
                <small v-if="measurementUnits.weightUnit === 'lb'" class="unit-hint">Será automaticamente convertido para gramas</small>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Localização</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Cidade:</span>
                <input v-model="newDuck.location.city" class="form-input-small" placeholder="Cidade" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <input v-model="newDuck.location.country" class="form-input-small" placeholder="País" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Latitude:</span>
                <input v-model.number="newDuck.location.gps.lat" type="number" step="0.000001" class="form-input-small" placeholder="Latitude" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Longitude:</span>
                <input v-model.number="newDuck.location.gps.lon" type="number" step="0.000001" class="form-input-small" placeholder="Longitude" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Precisão ({{ measurementUnits.precisionUnit }}):</span>
                <input v-model.number="newDuck.location.precision" type="number" step="0.1" class="form-input-small" :placeholder="`Precisão em ${measurementUnits.precisionUnit}`">
                <small v-if="measurementUnits.precisionUnit === 'yd'" class="unit-hint">Será automaticamente convertido para cm</small>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ponto de Referência:</span>
                <input v-model="newDuck.location.referencePoint" class="form-input-small" placeholder="Ponto de referência">
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Status</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Estado de Hibernação:</span>
                <select v-model="newDuck.status" class="form-input-small">
                  <option value="awake">Acordado</option>
                  <option value="trance">Transe</option>
                  <option value="deep-hibernation">Hibernação Profunda</option>
                </select>
              </div>
              <div class="detail-item">
                <span class="detail-label">Frequência Cardíaca (bpm):</span>
                <input v-model.number="newDuck.heartRate" type="number" class="form-input-small" placeholder="BPM">
              </div>
              <div class="detail-item">
                <span class="detail-label">Mutações:</span>
                <input v-model.number="newDuck.mutations" type="number" class="form-input-small" placeholder="Número de mutações">
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="newDuck.superpower">
            <h3>Superpoder</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Nome:</span>
                <input v-model="newDuck.superpower.name" class="form-input-small" placeholder="Nome do superpoder">
              </div>
              <div class="detail-item">
                <span class="detail-label">Tipo:</span>
                <input v-model="newDuck.superpower.classification.type" class="form-input-small" placeholder="Tipo">
              </div>
              <div class="detail-item">
                <span class="detail-label">Raridade:</span>
                <select v-model="newDuck.superpower.classification.rarity" class="form-input-small">
                  <option value="common">Comum</option>
                  <option value="uncommon">Incomum</option>
                  <option value="rare">Raro</option>
                  <option value="epic">Épico</option>
                  <option value="legendary">Lendário</option>
                </select>
              </div>
              <div class="detail-item">
                <span class="detail-label">Risco (%):</span>
                <input v-model.number="newDuck.superpower.classification.risk" type="number" min="0" max="100" class="form-input-small" placeholder="0-100">
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Descrição:</span>
                <textarea v-model="newDuck.superpower.description" class="form-textarea" placeholder="Descrição do superpoder" rows="3"></textarea>
              </div>
            </div>
          </div>

          <div class="detail-section" v-else>
            <h3>Adicionar Superpoder</h3>
            <button @click="addSuperpowerToNew" class="btn-add-superpower">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Adicionar Superpoder
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="saveNewDuck" class="modal-btn primary-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Criar Pato
          </button>
          <button @click="closeCreateModal" class="modal-btn secondary-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>