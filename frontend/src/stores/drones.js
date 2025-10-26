import { ref, computed } from 'vue'

export const drones = ref([])

const API_URL = '/api/drones'

// Load all drones from API
export const loadDrones = async () => {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch drones')
    }
    const data = await response.json()
    drones.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error loading drones:', error)
    drones.value = []
  }
}

// Create a new drone
export const addDrone = async (drone) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(drone)
    })
    if (!response.ok) {
      throw new Error('Failed to create drone')
    }
    const newDrone = await response.json()
    drones.value.push(newDrone)
    return newDrone
  } catch (error) {
    console.error('Error adding drone:', error)
    throw error
  }
}

// Update a drone
export const updateDrone = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update drone')
    }
    const updatedDrone = await response.json()
    const index = drones.value.findIndex(d => d.id === id)
    if (index !== -1) {
      drones.value[index] = updatedDrone
    }
    return updatedDrone
  } catch (error) {
    console.error('Error updating drone:', error)
    throw error
  }
}

// Delete a drone
export const deleteDrone = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete drone')
    }
    const index = drones.value.findIndex(d => d.id === id)
    if (index !== -1) {
      drones.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Error deleting drone:', error)
    throw error
  }
}

// Get a specific drone
export const getDrone = (id) => {
  return drones.value.find(d => d.id === id) || null
}

// Computed properties
export const totalDrones = computed(() => {
  return drones.value.length
})

export const activeDrones = computed(() => {
  return drones.value.filter(d => d.status === 'active').length
})

export const inactiveDrones = computed(() => {
  return drones.value.filter(d => d.status === 'inactive').length
})

export const maintenanceDrones = computed(() => {
  return drones.value.filter(d => d.status === 'maintenance').length
})

