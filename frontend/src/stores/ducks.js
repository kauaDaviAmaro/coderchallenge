import { ref, computed } from 'vue'

export const primordialDucks = ref([])

const API_URL = '/api/ducks'

// Unit conversion utilities
export const unitConverters = {
  // Weight conversions (grams <-> pounds)
  weight: {
    lbToGram: (lb) => lb * 453.592,
    gramToLb: (gram) => gram / 453.592,
    gramToPound: (gram) => gram / 453.592,
    poundToGram: (lb) => lb * 453.592,
  },
  // Height conversions (cm <-> feet/inches)
  height: {
    ftToCm: (ft) => ft * 30.48,
    cmToFt: (cm) => cm / 30.48,
    inchesToCm: (inches) => inches * 2.54,
    cmToInches: (cm) => cm / 2.54,
  },
  // Distance conversions (cm <-> yards)
  distance: {
    yardToCm: (yard) => yard * 91.44,
    cmToYard: (cm) => cm / 91.44,
  }
}

export const hibernationStatuses = ['awake', 'trance', 'deep-hibernation']

export const addDuck = async (duck) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duck)
    })
    if (!response.ok) {
      throw new Error('Failed to create duck')
    }
    const newDuck = await response.json()
    if (Array.isArray(primordialDucks.value)) {
      primordialDucks.value.push(newDuck)
    }
    return newDuck.id
  } catch (error) {
    console.error('Error adding duck:', error)
    // Fallback to local storage
    const duckWithId = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      ...duck,
      registeredAt: new Date().toISOString()
    }
    if (!Array.isArray(primordialDucks.value)) {
      primordialDucks.value = []
    }
    primordialDucks.value.push(duckWithId)
    return duckWithId.id
  }
}

export const updateDuck = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update duck')
    }
    const updatedDuck = await response.json()
    if (Array.isArray(primordialDucks.value)) {
      const index = primordialDucks.value.findIndex(d => d.id === id)
      if (index !== -1) {
        primordialDucks.value[index] = updatedDuck
      }
    }
  } catch (error) {
    console.error('Error updating duck:', error)
    // Fallback to local update
    if (Array.isArray(primordialDucks.value)) {
      const index = primordialDucks.value.findIndex(d => d.id === id)
      if (index !== -1) {
        primordialDucks.value[index] = { ...primordialDucks.value[index], ...data }
      }
    }
  }
}

export const deleteDuck = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete duck')
    }
    if (Array.isArray(primordialDucks.value)) {
      const index = primordialDucks.value.findIndex(d => d.id === id)
      if (index !== -1) {
        primordialDucks.value.splice(index, 1)
      }
    }
  } catch (error) {
    console.error('Error deleting duck:', error)
    // Fallback to local delete
    if (Array.isArray(primordialDucks.value)) {
      const index = primordialDucks.value.findIndex(d => d.id === id)
      if (index !== -1) {
        primordialDucks.value.splice(index, 1)
      }
    }
  }
}

export const getDuck = (id) => {
  if (!Array.isArray(primordialDucks.value)) return null
  return primordialDucks.value.find(d => d.id == id) || null
}

// Mark a duck as captured
export const markAsCaptured = async (id) => {
  try {
    console.log('Marking duck as captured, ID:', id)
    const response = await fetch(`${API_URL}/${id}/capture`, {
      method: 'PATCH'
    })
    
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to capture duck:', errorText)
      throw new Error(`Failed to capture duck: ${response.status} - ${errorText}`)
    }
    
    const updatedDuck = await response.json()
    console.log('Updated duck:', updatedDuck)
    
    // Update in local store
    if (Array.isArray(primordialDucks.value)) {
      const index = primordialDucks.value.findIndex(d => d.id == id)
      if (index !== -1) {
        primordialDucks.value[index] = updatedDuck
        console.log('Updated local store with captured duck')
      } else {
        console.warn('Duck not found in local store:', id)
      }
    }
    
    return updatedDuck
  } catch (error) {
    console.error('Error capturing duck:', error)
    // Fallback to local update
    if (Array.isArray(primordialDucks.value)) {
      const index = primordialDucks.value.findIndex(d => d.id == id)
      if (index !== -1) {
        primordialDucks.value[index] = {
          ...primordialDucks.value[index],
          isCaptured: true,
          capturedAt: new Date().toISOString()
        }
        console.log('Updated local store with fallback')
        return primordialDucks.value[index]
      }
    }
    return null
  }
}

// Search for a random duck (creates a random duck)
export const searchRandomDuck = async (droneId = null) => {
  try {
    const response = await fetch(`${API_URL}/search-random`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(droneId ? { droneId } : {})
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to search for random duck')
    }
    
    const newDuck = await response.json()
    
    // Add the new duck to the store
    if (Array.isArray(primordialDucks.value)) {
      primordialDucks.value.push(newDuck)
    } else {
      primordialDucks.value = [newDuck]
    }
    
    return newDuck
  } catch (error) {
    console.error('Error searching for random duck:', error)
    throw error
  }
}

// Load all ducks from API
export const loadDucks = async () => {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch ducks')
    }
    const ducks = await response.json()
    // Ensure it's always an array
    primordialDucks.value = Array.isArray(ducks) ? ducks : []
  } catch (error) {
    console.error('Error loading ducks:', error)
    // Fallback to empty array if API fails
    primordialDucks.value = []
  }
}

// Load only captured ducks from API
export const loadCapturedDucks = async () => {
  try {
    const response = await fetch(`${API_URL}/list/captured`)
    if (!response.ok) {
      throw new Error('Failed to fetch captured ducks')
    }
    const ducks = await response.json()
    return Array.isArray(ducks) ? ducks : []
  } catch (error) {
    console.error('Error loading captured ducks:', error)
    return []
  }
}

// Analysis functions for Mission 2
export const calculateOperationalCost = (duck) => {
  if (!duck || !duck.height || !duck.weight) return 0
  
  const baseCost = 100
  const heightFactor = (duck.height || 0) / 100 // 1cm = $1
  const weightFactor = (duck.weight || 0) / 1000 // 1kg = $1
  
  // Distance from DSIN (assuming Brazil as base)
  let distanceFactor = 0
  if (duck.location && duck.location.gps) {
    const distance = calculateDistance(
      { lat: -15.7942, lon: -47.8822 }, // Brasília DSIN (estimated)
      duck.location.gps
    )
    distanceFactor = distance * 0.5 // $0.5 per km
  }
  
  return baseCost + heightFactor + weightFactor + distanceFactor
}

export const calculateRiskLevel = (duck) => {
  if (!duck || !duck.status) return 0
  
  // Use the risk value directly from superpower if it exists
  if (duck.superpower && duck.superpower.classification && duck.superpower.classification.risk !== null && duck.superpower.classification.risk !== undefined) {
    return duck.superpower.classification.risk
  }
  
  // Fallback to direct superpowerRisk field (for backwards compatibility)
  if (duck.superpowerRisk !== null && duck.superpowerRisk !== undefined) {
    return duck.superpowerRisk
  }
  
  // Calculate risk based on status for ducks without superpower
  let risk = 0
  
  if (duck.status === 'awake') risk += 25
  else if (duck.status === 'trance') {
    risk += 15
    const heartRate = duck.heartRate || 0
    if (heartRate > 60) risk += 10 // High heart rate = more dangerous
    if (heartRate > 100) risk += 15 // Very dangerous
  } else if (duck.status === 'deep-hibernation') risk += 5
  
  return Math.min(risk, 100)
}

export const calculateMilitaryPowerNeeded = (duck) => {
  if (!duck) return 50
  
  const risk = calculateRiskLevel(duck)
  const weight = (duck.weight || 0) / 1000 // kg
  const height = (duck.height || 0) / 100 // m
  
  let power = Math.floor((risk * 2) + (weight / 100) + (height * 10))
  
  if (duck.superpower) {
    const rarity = duck.superpower.classification?.rarity || 'common'
    if (rarity === 'legendary') power += 500
    else if (rarity === 'rare') power += 200
    else if (rarity === 'epic') power += 100
  }
  
  return Math.max(power, 50) // Minimum power needed
}

export const calculateKnowledgeGain = (duck) => {
  if (!duck) return 0
  return (duck.mutations || 0) * 50 + (duck.status === 'deep-hibernation' ? 30 : 0)
}

export const calculateGenomeSequencingCost = (duck) => {
  if (!duck) return 0
  return (duck.mutations || 0) * 2500 // $2500 per mutation
}

// Calculate distance between two GPS coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lon || !coord2.lat || !coord2.lon) {
    return 0
  }
  
  const R = 6371 // Earth's radius in km
  const lat1 = coord1.lat * Math.PI / 180
  const lat2 = coord2.lat * Math.PI / 180
  const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180
  const deltaLon = (coord2.lon - coord1.lon) * Math.PI / 180
  
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon/2) * Math.sin(deltaLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}

// Computed stats
export const totalDucks = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return 0
  return primordialDucks.value.length
})

export const awakeDucks = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return 0
  return primordialDucks.value.filter(d => d.status === 'awake').length
})

export const hibernatingDucks = computed(() => {
  if (!Array.isArray(primordialDucks.value)) return 0
  return primordialDucks.value.filter(d => d.status === 'deep-hibernation').length
})

export const totalOperationalCost = computed(() => {
  if (!Array.isArray(primordialDucks.value) || primordialDucks.value.length === 0) return 0
  return primordialDucks.value.reduce((sum, duck) => sum + calculateOperationalCost(duck), 0)
})

export const averageRisk = computed(() => {
  if (!Array.isArray(primordialDucks.value) || primordialDucks.value.length === 0) return 0
  const sum = primordialDucks.value.reduce((sum, duck) => sum + calculateRiskLevel(duck), 0)
  return sum / primordialDucks.value.length
})

