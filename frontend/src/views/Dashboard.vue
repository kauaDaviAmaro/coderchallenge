<script setup>
import '../assets/css/dashboard.css'
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  primordialDucks, 
  totalDucks,
  awakeDucks,
  hibernatingDucks,
  totalOperationalCost,
  averageRisk,
  calculateKnowledgeGain,
  calculateRiskLevel
} from '../stores/ducks.js'
import { 
  drones,
  totalDrones,
  activeDrones,
  inactiveDrones,
  maintenanceDrones,
  loadDrones
} from '../stores/drones.js'

const router = useRouter()

const isMounted = ref(false)

const cpuUsage = ref(72)
const memoryUsage = ref(84)
const networkUsage = ref(45)
const storageUsage = ref(68)
const networkSpeed = ref(256)
const uptime = ref('12d 4h 23m')
const activeSessions = ref(1247)
const dataProcessed = ref(8.5)
const performanceScore = ref(92)
const currentTime = ref('')

let updateInterval = null
let timeInterval = null

const totalKnowledge = computed(() => {
  return primordialDucks.value.reduce((sum, duck) => sum + calculateKnowledgeGain(duck), 0)
})

const highRiskDucks = computed(() => {
  return primordialDucks.value.filter(duck => calculateRiskLevel(duck) >= 70).length
})

const capturedDucks = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return 0
  return primordialDucks.value.filter(duck => duck.isCaptured).length
})

const captureSuccessRate = computed(() => {
  if (totalDucks.value === 0) return 0
  return ((capturedDucks.value / totalDucks.value) * 100).toFixed(1)
})

const tranceDucks = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return 0
  return primordialDucks.value.filter(duck => duck.status === 'trance').length
})

const totalMutations = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return 0
  return primordialDucks.value.reduce((sum, duck) => sum + (duck.mutations || 0), 0)
})

const averageMutations = computed(() => {
  if (totalDucks.value === 0) return 0
  return (totalMutations.value / totalDucks.value).toFixed(1)
})

const recentlyCaptured = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return []
  return primordialDucks.value
    .filter(duck => duck.isCaptured && duck.capturedAt)
    .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt))
    .slice(0, 3)
})

const updateMetrics = () => {
  cpuUsage.value = Math.floor(Math.random() * 30) + 60
  memoryUsage.value = Math.floor(Math.random() * 30) + 70
  networkUsage.value = Math.floor(Math.random() * 40) + 30
  networkSpeed.value = Math.floor(Math.random() * 100) + 200
  performanceScore.value = Math.floor(Math.random() * 10) + 85
  activeSessions.value = Math.floor(Math.random() * 500) + 1000
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour12: false })
}

const navigateToMission = (mission) => {
  router.push(`/${mission}`)
}

onMounted(async () => {
  updateTime()
  updateMetrics()
  
  // Load drones data
  await loadDrones()
  
  timeInterval = setInterval(updateTime, 1000)
  updateInterval = setInterval(updateMetrics, 3000)
  
  // Trigger fade-in animations after component is mounted
  await nextTick()
  setTimeout(() => {
    isMounted.value = true
  }, 100)
  
  console.log('Dashboard mounted')
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (timeInterval) clearInterval(timeInterval)
})
</script>


<template>
  <div class="dashboard-container">
    <!-- Animated background grid -->
    <div class="grid-overlay" :class="{ 'fade-in': isMounted }"></div>
    
    <div class="dashboard-header" :class="{ 'fade-in': isMounted }">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#dc2626"/>
              <rect x="8" y="8" width="16" height="16" stroke="#ffffff" stroke-width="2"/>
              <rect x="12" y="12" width="8" height="8" fill="#ffffff"/>
            </svg>
          </div>
          <h1 class="dashboard-title">TECH DASH</h1>
        </div>
      </div>
      <div class="status-indicators">
        <div class="status-item">
          <span class="status-dot online"></span>
          <span>SYSTEM ACTIVE</span>
        </div>
        <div class="status-item">
          <span class="time">{{ currentTime }}</span>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card fade-in-delay-1" :class="{ 'fade-in': isMounted }">
          <div class="stat-header">
            <span class="stat-label">CPU Usage</span>
            <span class="stat-value">{{ cpuUsage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: cpuUsage + '%' }"></div>
          </div>
        </div>

        <div class="stat-card fade-in-delay-2" :class="{ 'fade-in': isMounted }">
          <div class="stat-header">
            <span class="stat-label">Memory</span>
            <span class="stat-value">{{ memoryUsage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: memoryUsage + '%' }"></div>
          </div>
        </div>

        <div class="stat-card fade-in-delay-3" :class="{ 'fade-in': isMounted }">
          <div class="stat-header">
            <span class="stat-label">Network</span>
            <span class="stat-value">{{ networkSpeed }}MB/s</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: networkUsage + '%' }"></div>
          </div>
        </div>

        <div class="stat-card fade-in-delay-4" :class="{ 'fade-in': isMounted }">
          <div class="stat-header">
            <span class="stat-label">Storage</span>
            <span class="stat-value">{{ storageUsage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: storageUsage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Mission Overview -->
      <div class="mission-overview" :class="{ 'fade-in': isMounted }">
        <h2 class="mission-section-title">MISSÕES PRIMORDIAIS</h2>
        
        <div class="mission-grid">
          <div class="mission-card fade-in-delay-1" :class="{ 'fade-in': isMounted }" @click="navigateToMission('catalog')">
            <div class="mission-number">01</div>
            <h3>1ª Missão - Catalogar</h3>
            <p>Catálogo de Patos Primordiais</p>
            <div class="mission-stats">
              <div class="mission-stat">
                <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                  <path d="M9 8h6M9 12h6M9 16h4"/>
                </svg>
                <span class="stat-text">{{ totalDucks }} Catalogados</span>
              </div>
            </div>
            <div class="mission-status">
              <span class="status-badge success">Ativa</span>
            </div>
            <button class="enter-button" @click.stop="navigateToMission('catalog')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              ENTRAR
            </button>
          </div>

          <div class="mission-card fade-in-delay-2" :class="{ 'fade-in': isMounted }" @click="navigateToMission('analysis')">
            <div class="mission-number">02</div>
            <h3>2ª Missão - Análise</h3>
            <p>Análise de Custo-Benefício</p>
            <div class="mission-stats">
              <div class="mission-stat">
                <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="stat-text">Risco: {{ averageRisk.toFixed(1) }}%</span>
              </div>
              <div class="mission-stat">
                <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="2" x2="12" y2="22"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
                <span class="stat-text">${{ totalOperationalCost.toFixed(0) }}</span>
              </div>
            </div>
            <div class="mission-status">
              <span class="status-badge" :class="averageRisk > 50 ? 'warning' : 'success'">
                {{ averageRisk > 50 ? 'Alto Risco' : 'Operacional' }}
              </span>
            </div>
            <button class="enter-button" @click.stop="navigateToMission('analysis')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              ENTRAR
            </button>
          </div>

          <div class="mission-card fade-in-delay-3" :class="{ 'fade-in': isMounted }" @click="navigateToMission('capture')">
            <div class="mission-number">03</div>
            <h3>3ª Missão - Capturar</h3>
            <p>Sistema de Controle de Drone</p>
            <div class="mission-stats">
              <div class="mission-stat">
                <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 10c0-2 1.5-4 4-4s4 2 4 4c0 3-2 6-4 8-2-2-4-5-4-8z"/>
                  <path d="M12 6v2M12 18v2"/>
                </svg>
                <span class="stat-text">{{ highRiskDucks }} Alto Risco</span>
              </div>
              <div class="mission-stat">
                <svg class="stat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                <span class="stat-text">{{ awakeDucks }} Despertos</span>
              </div>
            </div>
            <div class="mission-status">
              <span class="status-badge" :class="highRiskDucks > 0 ? 'warning' : 'success'">
                {{ highRiskDucks > 0 ? 'Ação Necessária' : 'Pronto' }}
              </span>
            </div>
            <button class="enter-button" @click.stop="navigateToMission('capture')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              ENTRAR
            </button>
          </div>
        </div>
      </div>

      <!-- System Info Cards -->
      <div class="info-cards">
        <div class="info-card large fade-in-delay-1" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Status Operacional</h2>
            <span class="badge success">OPERATIONAL</span>
          </div>
          <div class="card-content">
            <div class="metric-row">
              <span class="metric-label">Patos Catalogados</span>
              <span class="metric-value">{{ totalDucks }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Despertos</span>
              <span class="metric-value danger">{{ awakeDucks }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Em Hibernação</span>
              <span class="metric-value">{{ hibernatingDucks }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Conhecimento Total</span>
              <span class="metric-value high">+{{ totalKnowledge }}</span>
            </div>
          </div>
        </div>

        <div class="info-card fade-in-delay-2" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Performance</h2>
          </div>
          <div class="card-content">
            <div class="performance-circle">
              <div class="circle-progress" :style="{ '--progress': performanceScore }">
                <span class="circle-value">{{ performanceScore }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="info-card fade-in-delay-3" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Alerts</h2>
          </div>
          <div class="card-content">
            <div class="alert-list">
              <div v-if="totalDucks === 0" class="alert-item">
                <svg class="alert-icon warning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="alert-text">Nenhum Pato catalogado</span>
              </div>
              <div v-else-if="highRiskDucks > 0" class="alert-item">
                <svg class="alert-icon danger" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span class="alert-text">{{ highRiskDucks }} Patos de alto risco detectados</span>
              </div>
              <div v-else class="alert-item">
                <svg class="alert-icon success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span class="alert-text">Sistema operacional</span>
              </div>
              <div class="alert-item">
                <svg class="alert-icon info" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span class="alert-text">Risco médio: {{ averageRisk.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information Cards -->
      <div class="additional-info-grid">
        <!-- Drone Fleet Status -->
        <div class="info-card fade-in-delay-4" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Drone Fleet</h2>
            <span class="badge" :class="activeDrones > 0 ? 'success' : 'warning'">
              {{ activeDrones > 0 ? 'ACTIVE' : 'IDLE' }}
            </span>
          </div>
          <div class="card-content">
            <div class="metric-row">
              <span class="metric-label">Total Drones</span>
              <span class="metric-value">{{ totalDrones }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Active</span>
              <span class="metric-value success">{{ activeDrones }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Inactive</span>
              <span class="metric-value">{{ inactiveDrones }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Maintenance</span>
              <span class="metric-value warning">{{ maintenanceDrones }}</span>
            </div>
          </div>
        </div>

        <!-- Capture Statistics -->
        <div class="info-card fade-in-delay-4" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Capturas</h2>
            <span class="badge" :class="capturedDucks > 0 ? 'success' : 'info'">
              {{ capturedDucks }}/{{ totalDucks }}
            </span>
          </div>
          <div class="card-content">
            <div class="capture-stats">
              <div class="stat-circle">
                <div class="circle-progress" :style="{ '--progress': captureSuccessRate }">
                  <span class="circle-value-small">{{ captureSuccessRate }}%</span>
                </div>
              </div>
              <div class="stat-list">
                <div class="stat-item">
                  <span class="stat-label-small">Capturados</span>
                  <span class="stat-value-small">{{ capturedDucks }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label-small">Taxa de Sucesso</span>
                  <span class="stat-value-small">{{ captureSuccessRate }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="info-card fade-in-delay-5" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Distribuição de Status</h2>
          </div>
          <div class="card-content">
            <div class="status-bar">
              <div class="status-item-bar">
                <span class="status-label">Despertos</span>
                <div class="bar-wrapper">
                  <div class="bar-fill danger" :style="{ width: (awakeDucks / Math.max(totalDucks, 1)) * 100 + '%' }"></div>
                </div>
                <span class="status-value">{{ awakeDucks }}</span>
              </div>
              <div class="status-item-bar">
                <span class="status-label">Trance</span>
                <div class="bar-wrapper">
                  <div class="bar-fill warning" :style="{ width: (tranceDucks / Math.max(totalDucks, 1)) * 100 + '%' }"></div>
                </div>
                <span class="status-value">{{ tranceDucks }}</span>
              </div>
              <div class="status-item-bar">
                <span class="status-label">Hibernação</span>
                <div class="bar-wrapper">
                  <div class="bar-fill success" :style="{ width: (hibernatingDucks / Math.max(totalDucks, 1)) * 100 + '%' }"></div>
                </div>
                <span class="status-value">{{ hibernatingDucks }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Genomic Information -->
        <div class="info-card fade-in-delay-5" :class="{ 'fade-in': isMounted }">
          <div class="card-header">
            <h2>Dados Genômicos</h2>
            <span class="badge info">SEQUENCIAMENTO</span>
          </div>
          <div class="card-content">
            <div class="metric-row">
              <span class="metric-label">Total de Mutações</span>
              <span class="metric-value high">{{ totalMutations }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Média por Pato</span>
              <span class="metric-value">{{ averageMutations }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Conhecimento Total</span>
              <span class="metric-value high">+{{ totalKnowledge }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Risco Médio</span>
              <span class="metric-value" :class="averageRisk >= 50 ? 'danger' : 'success'">
                {{ averageRisk.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Recently Captured -->
        <div class="info-card large fade-in-delay-6" :class="{ 'fade-in': isMounted }" v-if="recentlyCaptured.length > 0">
          <div class="card-header">
            <h2>Capturas Recentes</h2>
          </div>
          <div class="card-content">
            <div class="recent-captures">
              <div v-for="(duck, index) in recentlyCaptured" :key="duck.id" class="capture-item">
                <div class="capture-number">#{{ index + 1 }}</div>
                <div class="capture-details">
                  <div class="capture-name">{{ duck.name || 'Sem Nome' }}</div>
                  <div class="capture-info">
                    <span class="capture-meta">Risco: {{ calculateRiskLevel(duck) }}%</span>
                    <span class="capture-meta">Mutações: {{ duck.mutations || 0 }}</span>
                  </div>
                </div>
                <div class="capture-time">{{ new Date(duck.capturedAt).toLocaleDateString('pt-BR') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
