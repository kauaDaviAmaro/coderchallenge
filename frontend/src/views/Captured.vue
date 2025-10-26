<script setup>
import '../assets/css/captured.css'
import '../assets/css/catalog.css'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { primordialDucks, loadDucks, calculateOperationalCost, calculateKnowledgeGain, calculateGenomeSequencingCost } from '../stores/ducks.js'

const router = useRouter()
const capturedDucks = ref([])
const selectedDuck = ref(null)
const showModal = ref(false)
const isLoading = ref(false)

// Filter states
const filters = ref({
  search: '',
  status: '',
  country: '',
  hasSuperpower: ''
})

onMounted(async () => {
  isLoading.value = true
  await loadDucks()
  capturedDucks.value = primordialDucks.value.filter(d => d.isCaptured)
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

const getStatusLabel = (status) => {
  const labels = {
    'awake': 'Acordado',
    'trance': 'Transe',
    'deep-hibernation': 'Hibernação Profunda'
  }
  return labels[status] || status
}

const viewDuck = (duck) => {
  selectedDuck.value = duck
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDuck.value = null
}

const totalKnowledge = computed(() => {
  return capturedDucks.value.reduce((sum, duck) => sum + calculateKnowledgeGain(duck), 0)
})

const totalGenomeCost = computed(() => {
  return capturedDucks.value.reduce((sum, duck) => sum + calculateGenomeSequencingCost(duck), 0)
})

const totalOperationalCost = computed(() => {
  return capturedDucks.value.reduce((sum, duck) => sum + calculateOperationalCost(duck), 0)
})

const superpowersCount = computed(() => {
  return capturedDucks.value.filter(d => d.superpower).length
})

const averageMutations = computed(() => {
  if (capturedDucks.value.length === 0) return 0
  const total = capturedDucks.value.reduce((sum, duck) => sum + (duck.mutations || 0), 0)
  return (total / capturedDucks.value.length).toFixed(1)
})

const filteredDucks = computed(() => {
  let filtered = [...capturedDucks.value]
  
  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(duck => 
      duck.id.toLowerCase().includes(search) ||
      duck.location?.city?.toLowerCase().includes(search) ||
      duck.location?.country?.toLowerCase().includes(search)
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
  
  return filtered
})

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    country: '',
    hasSuperpower: ''
  }
}

const availableCountries = computed(() => {
  return [...new Set(capturedDucks.value.map(duck => duck.location?.country).filter(Boolean))].sort()
})
</script>

<template>
  <div class="analysis-container">
    <div class="grid-overlay"></div>
    
    <div class="analysis-header">
      <h1 class="mission-title">PATOS CAPTURADOS</h1>
      <p class="mission-subtitle">Operação Primordial - Arquivo de Sucesso</p>
    </div>

    <div class="overall-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Capturados</span>
          <span class="stat-value">{{ capturedDucks.length }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Conhecimento Total</span>
          <span class="stat-value">{{ totalKnowledge }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Custo Total</span>
          <span class="stat-value">${{ totalOperationalCost.toFixed(2) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Superpoderes</span>
          <span class="stat-value">{{ superpowersCount }}</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>Carregando patos capturados...</p>
    </div>

    <div v-else-if="capturedDucks.length === 0" class="empty-state">
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
      <h2>Nenhum Pato Capturado</h2>
      <p>Comece capturando patos na página de Captura!</p>
      <button @click="router.push('/capture')" class="btn-create-duck">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
        Ir para Captura
      </button>
    </div>

    <div v-else class="analysis-table-section">
      <h2>Lista de Patos Capturados</h2>
      
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
              placeholder="ID, Cidade, País..."
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

          <button @click="clearFilters" class="filter-clear-btn" v-if="filters.search || filters.status || filters.country || filters.hasSuperpower">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Limpar Filtros
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="analysis-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Localização</th>
              <th>Altura/Peso</th>
              <th>Mutações</th>
              <th>Superpoder</th>
              <th>Capturado Em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="duck in filteredDucks" :key="duck.id" class="table-row">
              <td>
                <code>#{{ duck.id.substring(0, 8) }}</code>
              </td>
              <td>
                <span class="status-badge" :style="{ backgroundColor: getStatusBadge(duck.status).color }">
                  {{ getStatusLabel(duck.status) }}
                </span>
              </td>
              <td>
                <div class="location-cell">
                  <span class="city">{{ duck.location?.city || '-' }}</span>
                  <span class="country">{{ duck.location?.country || '-' }}</span>
                </div>
              </td>
              <td>
                <div class="measurements">
                  <span>{{ formatHeight(duck.height) }}</span>
                  <span>{{ formatWeight(duck.weight) }}</span>
                </div>
              </td>
              <td>
                <span class="mutations-badge">{{ duck.mutations || 0 }}</span>
              </td>
              <td>
                <span v-if="duck.superpower" class="superpower-badge" :class="duck.superpower.classification?.rarity">
                  {{ duck.superpower.name }}
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ formatDate(duck.capturedAt) }}</td>
              <td>
                <button @click="viewDuck(duck)" class="action-btn view">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Detalhes
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Duck Details Modal -->
    <div v-if="showModal && selectedDuck" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <h2>Detalhes do Pato Capturado</h2>
        
        <div class="modal-body">
          <div class="detail-section">
            <h3>Informações Básicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value"><code>{{ selectedDuck.id }}</code></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value" :style="{ color: getStatusBadge(selectedDuck.status).color }">
                  {{ getStatusLabel(selectedDuck.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Altura:</span>
                <span class="detail-value">{{ formatHeight(selectedDuck.height) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Peso:</span>
                <span class="detail-value">{{ formatWeight(selectedDuck.weight) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Mutações:</span>
                <span class="detail-value">{{ selectedDuck.mutations || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Batimentos:</span>
                <span class="detail-value">{{ selectedDuck.heartRate || '-' }} bpm</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Informações do Drone</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Serial:</span>
                <span class="detail-value">{{ selectedDuck.drone?.serial || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Marca:</span>
                <span class="detail-value">{{ selectedDuck.drone?.brand || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fabricante:</span>
                <span class="detail-value">{{ selectedDuck.drone?.manufacturer || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ selectedDuck.drone?.country || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Localização</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Cidade:</span>
                <span class="detail-value">{{ selectedDuck.location?.city || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <span class="detail-value">{{ selectedDuck.location?.country || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">GPS:</span>
                <span class="detail-value">{{ selectedDuck.location?.gps?.lat?.toFixed(4) }}, {{ selectedDuck.location?.gps?.lon?.toFixed(4) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedDuck.superpower">
            <h3>Superpoder</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Nome:</span>
                <span class="detail-value">{{ selectedDuck.superpower.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">{{ selectedDuck.superpower.classification?.type || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Raridade:</span>
                <span class="detail-value superpower-badge" :class="selectedDuck.superpower.classification?.rarity">
                  {{ selectedDuck.superpower.classification?.rarity || '-' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Descrição:</span>
                <span class="detail-value">{{ selectedDuck.superpower.description || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Informações de Captura</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Capturado em:</span>
                <span class="detail-value">{{ formatDate(selectedDuck.capturedAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Conhecimento:</span>
                <span class="detail-value">+{{ calculateKnowledgeGain(selectedDuck) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Custo Genoma:</span>
                <span class="detail-value">${{ calculateGenomeSequencingCost(selectedDuck).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Fechar</button>
          <button @click="router.push('/analysis')" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Ver Análise
          </button>
        </div>
      </div>
    </div>
  </div>
</template>