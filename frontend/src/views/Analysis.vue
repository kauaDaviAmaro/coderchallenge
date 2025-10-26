<template>
  <div class="analysis-container">
    <div class="grid-overlay"></div>
    
    <div class="analysis-header">
      <h1 class="mission-title">2ª MISSÃO - ANÁLISE</h1>
      <p class="mission-subtitle">Operação Visão de Captura - Análise de Custo-Benefício</p>
    </div>

    <div class="analysis-content">
      <!-- Overall Stats -->
      <div class="overall-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"/>
              <path d="M7 16l4-4 4 4 6-6"/>
              <path d="M7 12h10"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total de Patos</span>
            <span class="stat-value">{{ totalDucks }}</span>
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
            <span class="stat-label">Custo Operacional Total</span>
            <span class="stat-value">${{ totalOperationalCost.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 3.99L18.53 20H5.47L12 5.99z"/>
              <path d="M11 16h2v2h-2zm0-6h2v4h-2z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Risco Médio</span>
            <span class="stat-value">{{ averageRisk.toFixed(1) }}%</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Conhecimento Potencial</span>
            <span class="stat-value">{{ totalKnowledgeGain }}</span>
          </div>
        </div>
      </div>

      <!-- Detailed Analysis Table -->
      <div class="analysis-table-section">
        <h2>Análise Detalhada por Pato Primordial</h2>
        
        <div v-if="primordialDucks.length === 0" class="empty-state">
          <p>Nenhum Pato Primordial catalogado. Vá ao Catálogo primeiro!</p>
        </div>
        
        <!-- Filter Section -->
        <div v-else>
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
                <th>Custo Operacional</th>
                <th>Risco</th>
                <th>Poderio Militar</th>
                <th>Conhecimento</th>
                <th>Custo Genoma</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="duck in filteredDucks" :key="duck.id" class="table-row">
                <td>
                  <code>#{{ duck.id.substring(0, 8) }}</code>
                </td>
                <td>
                  <span class="status-badge" :class="duck.status">
                    {{ getStatusLabel(duck.status) }}
                  </span>
                </td>
                <td>
                  {{ duck.location.city }}, {{ duck.location.country }}
                </td>
                <td class="cost-cell">
                  ${{ calculateOperationalCost(duck).toFixed(2) }}
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
                <td class="knowledge-cell">
                  +{{ calculateKnowledgeGain(duck) }}
                </td>
                <td class="genome-cell">
                  ${{ calculateGenomeSequencingCost(duck).toLocaleString() }}
                </td>
                <td>
                  <button @click="selectDuck(duck.id)" class="action-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Capturar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="primordialDucks.length > 0" class="recommendations-section">
        <h2>Recomendações Estratégicas</h2>
        
        <div class="recommendations-grid">
          <div class="recommendation-card priority-high">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-2.5-3.5-2.5-5C8.5 4.5 7 6 7 8.5c0 2 2.5 3.5 2.5 6z"/>
                <path d="M12 5c2-2 5-3 5-3s1 1 1 3c0 2-1 3-1 4"/>
              </svg>
              Alta Prioridade
            </h3>
            <ul>
              <li v-for="duck in highPriorityDucks" :key="duck.id">
                Pato #{{ duck.id.substring(0, 8) }} - 
                Custo: ${{ calculateOperationalCost(duck).toFixed(2) }} | 
                Conhecimento: +{{ calculateKnowledgeGain(duck) }}
              </li>
            </ul>
          </div>
          
          <div class="recommendation-card priority-medium">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Prioridade Média
            </h3>
            <ul>
              <li v-for="duck in mediumPriorityDucks" :key="duck.id">
                Pato #{{ duck.id.substring(0, 8) }} - 
                Risco: {{ calculateRiskLevel(duck) }}% | 
                Poderio: {{ calculateMilitaryPowerNeeded(duck) }} MP
              </li>
            </ul>
          </div>
          
          <div class="recommendation-card priority-low">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                <path d="M2 12h20M12 2v20M5 5l14 14M5 19L19 5M17 12H7M12 17L7 7M12 7l5 10"/>
              </svg>
              Baixo Risco
            </h3>
            <ul>
              <li v-for="duck in lowRiskDucks" :key="duck.id">
                Pato #{{ duck.id.substring(0, 8) }} - 
                Status: {{ getStatusLabel(duck.status) }} | 
                Mutações: {{ duck.mutations }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../assets/css/analysis.css'
import '../assets/css/catalog.css'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  primordialDucks, 
  totalDucks, 
  totalOperationalCost, 
  averageRisk,
  calculateOperationalCost,
  calculateRiskLevel,
  calculateMilitaryPowerNeeded,
  calculateKnowledgeGain,
  calculateGenomeSequencingCost
} from '../stores/ducks.js'

const router = useRouter()

// Filter states
const filters = ref({
  search: '',
  status: '',
  country: '',
  hasSuperpower: ''
})

const getStatusLabel = (status) => {
  const labels = {
    'awake': 'Desperto',
    'trance': 'Em Transe',
    'deep-hibernation': 'Hibernação Profunda'
  }
  return labels[status] || status
}

const getRiskClass = (risk) => {
  if (risk >= 70) return 'risk-critical'
  if (risk >= 40) return 'risk-high'
  if (risk >= 20) return 'risk-medium'
  return 'risk-low'
}

const totalKnowledgeGain = computed(() => {
  return primordialDucks.value.reduce((sum, duck) => sum + calculateKnowledgeGain(duck), 0)
})

const highPriorityDucks = computed(() => {
  return [...primordialDucks.value]
    .sort((a, b) => {
      const benefitA = calculateKnowledgeGain(a) / calculateOperationalCost(a)
      const benefitB = calculateKnowledgeGain(b) / calculateOperationalCost(b)
      return benefitB - benefitA
    })
    .slice(0, 3)
})

const mediumPriorityDucks = computed(() => {
  return primordialDucks.value
    .filter(duck => {
      const risk = calculateRiskLevel(duck)
      const power = calculateMilitaryPowerNeeded(duck)
      return risk >= 30 && risk <= 60 && power <= 300
    })
    .slice(0, 5)
})

const lowRiskDucks = computed(() => {
  return primordialDucks.value
    .filter(duck => calculateRiskLevel(duck) <= 25)
    .slice(0, 5)
})

const selectDuck = (duckId) => {
  router.push({ name: 'Capture', query: { duckId } })
}

const filteredDucks = computed(() => {
  let filtered = [...primordialDucks.value]
  
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
  return [...new Set(primordialDucks.value.map(duck => duck.location?.country).filter(Boolean))].sort()
})
</script>