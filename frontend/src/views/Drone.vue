<script setup>
import '../assets/css/catalog.css'
import { ref, onMounted, computed } from 'vue'
import { loadDrones, addDrone, updateDrone, deleteDrone, drones } from '../stores/drones.js'
import { searchRandomDuck } from '../stores/ducks.js'

const isLoading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showSearchDuckModal = ref(false)
const newDrone = ref(null)
const droneToEdit = ref(null)
const droneToDelete = ref(null)
const selectedSearchDrone = ref(null)
const isSearchingDuck = ref(false)

// Filter states
const filters = ref({
  search: '',
  status: '',
  brand: '',
  country: ''
})

onMounted(async () => {
  isLoading.value = true
  await loadDrones()
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

const getStatusBadge = (status) => {
  const statuses = {
    'active': { label: 'Ativo', color: '#10b981' },
    'inactive': { label: 'Inativo', color: '#6b7280' },
    'maintenance': { label: 'Manutenção', color: '#f59e0b' }
  }
  return statuses[status] || { label: status, color: '#6b7280' }
}

const createNewDrone = () => {
  newDrone.value = {
    serial: '',
    brand: '',
    manufacturer: '',
    country: '',
    model: '',
    status: 'active',
    notes: ''
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newDrone.value = null
}

const saveNewDrone = async () => {
  if (!newDrone.value) return
  
  isLoading.value = true
  try {
    await addDrone(newDrone.value)
    await loadDrones()
    showCreateModal.value = false
    newDrone.value = null
  } catch (error) {
    console.error('Error creating drone:', error)
    alert('Erro ao criar drone: ' + error.message)
  }
  isLoading.value = false
}

const editDrone = (drone) => {
  droneToEdit.value = { ...drone }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  droneToEdit.value = null
}

const saveEdit = async () => {
  if (!droneToEdit.value) return
  
  isLoading.value = true
  try {
    await updateDrone(droneToEdit.value.id, droneToEdit.value)
    await loadDrones()
    showEditModal.value = false
    droneToEdit.value = null
  } catch (error) {
    console.error('Error updating drone:', error)
    alert('Erro ao salvar alterações: ' + error.message)
  }
  isLoading.value = false
}

const confirmDelete = (drone) => {
  droneToDelete.value = drone
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  droneToDelete.value = null
}

const handleDelete = async () => {
  if (droneToDelete.value) {
    isLoading.value = true
    await deleteDrone(droneToDelete.value.id)
    await loadDrones()
    isLoading.value = false
    showDeleteConfirm.value = false
    droneToDelete.value = null
  }
}

const openSearchDuckModal = () => {
  const activeDrones = drones.value.filter(d => d.status === 'active')
  
  if (activeDrones.length === 0) {
    alert('Não há drones ativos disponíveis para buscar patos!')
    return
  }
  
  // Set first active drone as default
  selectedSearchDrone.value = activeDrones[0].id
  showSearchDuckModal.value = true
}

const closeSearchDuckModal = () => {
  showSearchDuckModal.value = false
  selectedSearchDrone.value = null
}

const executeRandomDuckSearch = async () => {
  if (!selectedSearchDrone.value) {
    alert('Por favor, selecione um drone!')
    return
  }
  
  isSearchingDuck.value = true
  
  try {
    // Search for a random duck with the selected drone
    const newDuck = await searchRandomDuck(selectedSearchDrone.value)
    
    // Close modal and show success
    showSearchDuckModal.value = false
    alert(`Pato encontrado!\nLocalização: ${newDuck.location.city}, ${newDuck.location.country}\nStatus: ${newDuck.status}\nMutações: ${newDuck.mutations}${newDuck.superpower ? '\nSuperpoder: ' + newDuck.superpower.name : ''}`)
  } catch (error) {
    console.error('Error searching for random duck:', error)
    alert('Erro ao buscar pato aleatório: ' + error.message)
  } finally {
    isSearchingDuck.value = false
    selectedSearchDrone.value = null
  }
}

const filteredDrones = computed(() => {
  let filtered = [...drones.value]
  
  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(drone => 
      drone.serial?.toLowerCase().includes(search) ||
      drone.brand?.toLowerCase().includes(search) ||
      drone.manufacturer?.toLowerCase().includes(search) ||
      drone.country?.toLowerCase().includes(search) ||
      drone.model?.toLowerCase().includes(search)
    )
  }
  
  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(drone => drone.status === filters.value.status)
  }
  
  // Brand filter
  if (filters.value.brand) {
    filtered = filtered.filter(drone => drone.brand === filters.value.brand)
  }
  
  // Country filter
  if (filters.value.country) {
    filtered = filtered.filter(drone => drone.country === filters.value.country)
  }
  
  return filtered
})

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    brand: '',
    country: ''
  }
}

const availableBrands = computed(() => {
  return [...new Set(drones.value.map(drone => drone.brand).filter(Boolean))].sort()
})

const availableCountries = computed(() => {
  return [...new Set(drones.value.map(drone => drone.country).filter(Boolean))].sort()
})
</script>

<template>
  <div class="catalog-container">
    <div class="grid-overlay"></div>
    
    <div class="catalog-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span>Gestão de Drones</span>
        </h1>
        <button @click="createNewDrone" class="btn-create-duck">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Novo Drone</span>
        </button>
        <button @click="openSearchDuckModal" class="btn-create-duck">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>Buscar Pato</span>
        </button>
        <div class="header-stats">
          <div class="stat-box">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ filteredDrones.length }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Ativos:</span>
            <span class="stat-value stat-success">{{ filteredDrones.filter(d => d.status === 'active').length }}</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Inativos:</span>
            <span class="stat-value">{{ filteredDrones.filter(d => d.status === 'inactive').length }}</span>
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
            placeholder="Serial, Marca, Fabricante, País..."
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Status:</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="maintenance">Manutenção</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Marca:</label>
          <select v-model="filters.brand" class="filter-select">
            <option value="">Todas</option>
            <option v-for="brand in availableBrands" :key="brand" :value="brand">
              {{ brand }}
            </option>
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

        <button @click="clearFilters" class="filter-clear-btn" v-if="filters.search || filters.status || filters.brand || filters.country">
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
        <p>Carregando drones...</p>
      </div>

      <div v-else-if="drones.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <h2>Nenhum drone cadastrado</h2>
        <p>Comece cadastrando um drone para ver ele aqui.</p>
      </div>

      <div v-else-if="filteredDrones.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <h2>Nenhum drone encontrado</h2>
        <p>Nenhum drone corresponde aos filtros selecionados.</p>
      </div>

      <div v-else class="ducks-grid">
        <div v-for="drone in filteredDrones" :key="drone.id" class="duck-card">
          <div class="card-header">
            <div class="duck-id">
              <span class="id-label">Serial:</span>
              <span class="id-value">{{ drone.serial }}</span>
            </div>
            <div :class="['status-badge', `status-${drone.status}`]">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusBadge(drone.status).label }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="duck-info">
              <div class="info-row">
                <span class="info-label">Marca:</span>
                <span class="info-value">{{ drone.brand }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fabricante:</span>
                <span class="info-value">{{ drone.manufacturer }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">País:</span>
                <span class="info-value">{{ drone.country }}</span>
              </div>
              <div class="info-row" v-if="drone.model">
                <span class="info-label">Modelo:</span>
                <span class="info-value">{{ drone.model }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="footer-stats">
              <div class="stat-item">
                <span class="stat-text">{{ formatDate(drone.createdAt) }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button @click="editDrone(drone)" class="action-btn edit-btn" title="Editar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button @click="confirmDelete(drone)" class="action-btn delete-btn" title="Deletar">
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

    <!-- Create Modal -->
    <div v-if="showCreateModal && newDrone" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content edit-modal-content" @click.stop>
        <div class="modal-header">
          <h2>Criar Novo Drone</h2>
          <button @click="closeCreateModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body edit-form">
          <div class="detail-section">
            <h3>Informações Básicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Serial (requerido):</span>
                <input v-model="newDrone.serial" class="form-input-small" placeholder="Serial único" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Marca (requerido):</span>
                <input v-model="newDrone.brand" class="form-input-small" placeholder="Marca" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fabricante (requerido):</span>
                <input v-model="newDrone.manufacturer" class="form-input-small" placeholder="Fabricante" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">País (requerido):</span>
                <input v-model="newDrone.country" class="form-input-small" placeholder="País" required>
              </div>
              <div class="detail-item">
                <span class="detail-label">Modelo:</span>
                <input v-model="newDrone.model" class="form-input-small" placeholder="Modelo">
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <select v-model="newDrone.status" class="form-input-small">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="maintenance">Manutenção</option>
                </select>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Notas Adicionais</h3>
            <div class="detail-item full-width">
              <textarea v-model="newDrone.notes" class="form-textarea" placeholder="Notas sobre o drone" rows="4"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="saveNewDrone" class="modal-btn primary-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"/>
            </svg>
            Criar Drone
          </button>
          <button @click="closeCreateModal" class="modal-btn secondary-btn">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal && droneToEdit" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal-content" @click.stop>
        <div class="modal-header">
          <h2>Editar Drone</h2>
          <button @click="closeEditModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body edit-form">
          <div class="detail-section">
            <h3>Informações Básicas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Serial:</span>
                <input v-model="droneToEdit.serial" class="form-input-small" placeholder="Serial único">
              </div>
              <div class="detail-item">
                <span class="detail-label">Marca:</span>
                <input v-model="droneToEdit.brand" class="form-input-small" placeholder="Marca">
              </div>
              <div class="detail-item">
                <span class="detail-label">Fabricante:</span>
                <input v-model="droneToEdit.manufacturer" class="form-input-small" placeholder="Fabricante">
              </div>
              <div class="detail-item">
                <span class="detail-label">País:</span>
                <input v-model="droneToEdit.country" class="form-input-small" placeholder="País">
              </div>
              <div class="detail-item">
                <span class="detail-label">Modelo:</span>
                <input v-model="droneToEdit.model" class="form-input-small" placeholder="Modelo">
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <select v-model="droneToEdit.status" class="form-input-small">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="maintenance">Manutenção</option>
                </select>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Notas Adicionais</h3>
            <div class="detail-item full-width">
              <textarea v-model="droneToEdit.notes" class="form-textarea" placeholder="Notas sobre o drone" rows="4"></textarea>
            </div>
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
          <p>Tem certeza que deseja excluir o drone <strong>{{ droneToDelete?.serial }}</strong>?</p>
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

    <!-- Search Duck Modal -->
    <div v-if="showSearchDuckModal" class="modal-overlay" @click="closeSearchDuckModal">
      <div class="modal-content search-duck-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="modal-icon-search">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div>
              <h2>Buscar Pato</h2>
              <p class="modal-subtitle">Selecione um drone para iniciar a busca</p>
            </div>
          </div>
          <button @click="closeSearchDuckModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body search-modal-body">
          <div class="drone-selection-section">
            <label class="search-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Selecionar Drone
            </label>
            <select v-model="selectedSearchDrone" class="drone-select" :disabled="isSearchingDuck">
              <option v-for="drone in drones.filter(d => d.status === 'active')" :key="drone.id" :value="drone.id">
                {{ drone.serial }} - {{ drone.brand }} {{ drone.model || '' }}
              </option>
            </select>
          </div>

          <div v-if="selectedSearchDrone" class="drone-preview">
            <div class="preview-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span>Drone Selecionado</span>
            </div>
            <div class="preview-info">
              <div class="preview-item">
                <span class="preview-label">Serial:</span>
                <span class="preview-value">{{ drones.find(d => d.id === selectedSearchDrone)?.serial }}</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Marca:</span>
                <span class="preview-value">{{ drones.find(d => d.id === selectedSearchDrone)?.brand }}</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Fabricante:</span>
                <span class="preview-value">{{ drones.find(d => d.id === selectedSearchDrone)?.manufacturer }}</span>
              </div>
            </div>
          </div>

          <div class="search-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p>O drone irá buscar um pato aleatório em uma localização do Brasil. As características do pato (mutações, superpoderes, etc.) serão geradas aleatoriamente.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeSearchDuckModal" class="modal-btn secondary-btn" :disabled="isSearchingDuck">
            Cancelar
          </button>
          <button @click="executeRandomDuckSearch" class="modal-btn search-btn" :disabled="isSearchingDuck || !selectedSearchDrone">
            <svg v-if="!isSearchingDuck" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <div v-else class="spinner-small"></div>
            <span>{{ isSearchingDuck ? 'Buscando...' : 'Buscar Pato' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
