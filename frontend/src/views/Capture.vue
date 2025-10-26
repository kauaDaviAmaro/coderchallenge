<script setup>
import '../assets/css/capture.css'
import '../assets/css/catalog.css'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { primordialDucks, loadDucks, calculateRiskLevel, calculateOperationalCost, calculateMilitaryPowerNeeded } from '../stores/ducks.js'

const router = useRouter()
const ducks = ref([])
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
  ducks.value = primordialDucks.value.filter(d => !d.isCaptured)
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

const captureDuck = async (duck) => {
  // Navigate to fight screen
  router.push(`/fight/${duck.id}`)
}

const getRiskClass = (risk) => {
  if (risk >= 70) return 'high'
  if (risk >= 40) return 'medium'
  return 'low'
}

const getStatusLabel = (status) => {
  const labels = {
    'awake': 'Acordado',
    'trance': 'Transe',
    'deep-hibernation': 'Hibernação Profunda'
  }
  return labels[status] || status
}

const capturedCount = computed(() => {
  return primordialDucks.value.filter(d => d.isCaptured).length
})

const availableCount = computed(() => {
  return ducks.value.length
})

const filteredDucks = computed(() => {
  let filtered = [...ducks.value]
  
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
  return [...new Set(ducks.value.map(duck => duck.location?.country).filter(Boolean))].sort()
})
</script>

<template>
  <div class="analysis-container">
    <div class="grid-overlay"></div>
    
    <div class="analysis-header">
      <h1 class="mission-title">3ª MISSÃO - CAPTURAR</h1>
      <p class="mission-subtitle">Operação Patos Primordiais - Sistema de Captura</p>
    </div>

    <div class="overall-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Patos Disponíveis</span>
          <span class="stat-value">{{ availableCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Capturados</span>
          <span class="stat-value">{{ capturedCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-2.5-3.5-2.5-5C8.5 4.5 7 6 7 8.5c0 2 2.5 3.5 2.5 6z"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Taxa de Captura</span>
          <span class="stat-value">{{ primordialDucks.length > 0 ? ((capturedCount / primordialDucks.length) * 100).toFixed(1) : 0 }}%</span>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>Carregando patos disponíveis...</p>
    </div>

    <div v-else-if="ducks.length === 0" class="empty-state">
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 10h1m4 0h1m-6 4h.01M19 10c0 3.866-3.582 7-8 7s-8-3.134-8-7 3.582-7 8-7 8 3.134 8 7z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h2>Nenhum Pato Disponível</h2>
      <p>Todos os patos foram capturados!</p>
      <button @click="router.push('/catalog')" class="btn-create-duck">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <path d="M9 8h6M9 12h6M9 16h4"/>
        </svg>
        Ver Catálogo Completo
      </button>
    </div>

    <div v-else class="analysis-table-section">
      <h2>Patos Disponíveis para Captura</h2>
      
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
              <th>Risco</th>
              <th>Poderio Militar</th>
              <th>Superpoder</th>
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
                <div class="risk-bar">
                  <div 
                    class="risk-fill" 
                    :style="{ width: calculateRiskLevel(duck) + '%' }"
                    :class="getRiskClass(calculateRiskLevel(duck))"
                  ></div>
                  <span class="risk-value">{{ calculateRiskLevel(duck) }}%</span>
                </div>
              </td>
              <td class="military-cell">
                <span class="power-value">{{ calculateMilitaryPowerNeeded(duck) }}</span>
                <span class="power-unit">MP</span>
              </td>
              <td>
                <span v-if="duck.superpower" class="superpower-badge" :class="duck.superpower.classification?.rarity">
                  {{ duck.superpower.name }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewDuck(duck)" class="action-btn view">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button @click="captureDuck(duck)" class="action-btn capture">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                    Capturar
                  </button>
                </div>
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
        
        <h2>Detalhes do Pato</h2>
        
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
            <h3>Análise</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Risco:</span>
                <span class="detail-value">{{ calculateRiskLevel(selectedDuck) }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Custo Operacional:</span>
                <span class="detail-value">${{ calculateOperationalCost(selectedDuck).toFixed(2) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Poderio Militar:</span>
                <span class="detail-value">{{ calculateMilitaryPowerNeeded(selectedDuck) }} MP</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Fechar</button>
          <button @click="captureDuck(selectedDuck)" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            Confirmar Captura
          </button>
        </div>
      </div>
    </div>
  </div>
</template>