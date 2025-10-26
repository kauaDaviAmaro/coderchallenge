import express from 'express'
import Duck from '../models/Duck.js'
import Drone from '../models/Drone.js'

const router = express.Router()

// GET /api/ducks - Get all ducks
router.get('/', async (req, res) => {
  try {
    const ducks = await Duck.findAll({
      order: [['registeredAt', 'DESC']]
    })
    const transformedDucks = ducks.map(duck => transformDbToFrontend(duck))
    res.json(transformedDucks)
  } catch (error) {
    console.error('Error fetching ducks:', error)
    res.status(500).json({ error: 'Failed to fetch ducks' })
  }
})

// GET /api/ducks/:id - Get a single duck
router.get('/:id', async (req, res) => {
  try {
    const duck = await Duck.findByPk(req.params.id)
    if (!duck) {
      return res.status(404).json({ error: 'Duck not found' })
    }
    res.json(transformDbToFrontend(duck))
  } catch (error) {
    console.error('Error fetching duck:', error)
    res.status(500).json({ error: 'Failed to fetch duck' })
  }
})

// POST /api/ducks - Create a new duck
router.post('/', async (req, res) => {
  try {
    // Transform frontend data structure to database structure
    const duckData = transformFrontendToDb(req.body)
    console.log('Transformed duck data:', duckData)
    
    const duck = await Duck.create(duckData)
    res.status(201).json(transformDbToFrontend(duck))
  } catch (error) {
    console.error('Error creating duck:', error)
    console.error('Error details:', error.errors || error.message)
    res.status(500).json({ error: 'Failed to create duck', details: error.message })
  }
})

// PUT /api/ducks/:id - Update a duck
router.put('/:id', async (req, res) => {
  try {
    const duck = await Duck.findByPk(req.params.id)
    if (!duck) {
      return res.status(404).json({ error: 'Duck not found' })
    }
    
    const duckData = transformFrontendToDb(req.body)
    await duck.update(duckData)
    
    // Reload the duck to get fresh data
    await duck.reload()
    
    res.json(transformDbToFrontend(duck))
  } catch (error) {
    console.error('Error updating duck:', error)
    res.status(500).json({ error: 'Failed to update duck', details: error.message })
  }
})

// DELETE /api/ducks/:id - Delete a duck
router.delete('/:id', async (req, res) => {
  try {
    const duck = await Duck.findByPk(req.params.id)
    if (!duck) {
      return res.status(404).json({ error: 'Duck not found' })
    }
    
    await duck.destroy()
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting duck:', error)
    res.status(500).json({ error: 'Failed to delete duck' })
  }
})

// PATCH /api/ducks/:id/capture - Mark a duck as captured
router.patch('/:id/capture', async (req, res) => {
  try {
    const duck = await Duck.findByPk(req.params.id)
    if (!duck) {
      return res.status(404).json({ error: 'Duck not found' })
    }
    
    await duck.update({
      isCaptured: true,
      capturedAt: new Date()
    })
    
    res.json(transformDbToFrontend(duck))
  } catch (error) {
    console.error('Error capturing duck:', error)
    res.status(500).json({ error: 'Failed to capture duck' })
  }
})

// GET /api/ducks/captured - Get all captured ducks
router.get('/list/captured', async (req, res) => {
  try {
    const ducks = await Duck.findAll({
      where: { isCaptured: true },
      order: [['capturedAt', 'DESC']]
    })
    const transformedDucks = ducks.map(duck => transformDbToFrontend(duck))
    res.json(transformedDucks)
  } catch (error) {
    console.error('Error fetching captured ducks:', error)
    res.status(500).json({ error: 'Failed to fetch captured ducks' })
  }
})

// POST /api/ducks/search-random - Search/create a random duck
router.post('/search-random', async (req, res) => {
  try {
    // Get droneId from request, if provided
    const { droneId } = req.body
    
    // Get available drones
    let availableDrones = await Drone.findAll({
      where: { status: 'active' }
    })
    
    if (availableDrones.length === 0) {
      return res.status(400).json({ error: 'No active drones available' })
    }
    
    // Select drone (either from request or random)
    let selectedDrone
    if (droneId) {
      selectedDrone = availableDrones.find(d => d.id === parseInt(droneId))
      if (!selectedDrone) {
        // If provided droneId not found, use first available
        selectedDrone = availableDrones[0]
      }
    } else {
      // Randomly select a drone
      selectedDrone = availableDrones[Math.floor(Math.random() * availableDrones.length)]
    }
    
    // Generate random duck data
    const randomDuck = generateRandomDuck(selectedDrone)
    
    // Create the duck in database
    const duck = await Duck.create(randomDuck)
    
    res.status(201).json(transformDbToFrontend(duck))
  } catch (error) {
    console.error('Error creating random duck:', error)
    res.status(500).json({ error: 'Failed to create random duck', details: error.message })
  }
})

// Generate a random duck with random attributes
function generateRandomDuck(drone) {
  // Brazilian cities for location
  const locations = [
    { city: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lon: -43.1729, reference: 'Praia de Copacabana' },
    { city: 'São Paulo', country: 'Brasil', lat: -23.5505, lon: -46.6333, reference: 'Parque Ibirapuera' },
    { city: 'Brasília', country: 'Brasil', lat: -15.7942, lon: -47.8822, reference: 'Palácio da Alvorada' },
    { city: 'Manaus', country: 'Brasil', lat: -3.1190, lon: -60.0217, reference: 'Encontro das Águas' },
    { city: 'Salvador', country: 'Brasil', lat: -12.9714, lon: -38.5014, reference: 'Pelourinho' },
    { city: 'Curitiba', country: 'Brasil', lat: -25.4284, lon: -49.2733, reference: 'Jardim Botânico' },
    { city: 'Fortaleza', country: 'Brasil', lat: -3.7319, lon: -38.5267, reference: 'Beira Mar' },
    { city: 'Porto Alegre', country: 'Brasil', lat: -30.0346, lon: -51.2177, reference: 'Usina do Gasômetro' },
    { city: 'Recife', country: 'Brasil', lat: -8.0476, lon: -34.8770, reference: 'Marco Zero' },
    { city: 'Belém', country: 'Brasil', lat: -1.4558, lon: -48.5042, reference: 'Ver-o-Peso' },
    { city: 'Goiânia', country: 'Brasil', lat: -16.6864, lon: -49.2643, reference: 'Praça Cívica' },
    { city: 'Vitória', country: 'Brasil', lat: -20.3155, lon: -40.3128, reference: 'Ilha do Frade' },
  ]
  
  // Status options
  const statuses = ['awake', 'trance', 'deep-hibernation']
  
  // Superpower data
  const superpowers = [
    { name: 'Bola de Fogo', description: 'Capaz de lançar bolas de fogo intensas que atingem até 50 metros de distância', type: 'bélico', rarity: 'rare', risk: 75 },
    { name: 'Raios Elétricos', description: 'Gera descargas elétricas de alta voltagem', type: 'energia', rarity: 'epic', risk: 85 },
    { name: 'Control de Águas', description: 'Manipula corpos d\'água e cria ondas gigantes', type: 'elemental', rarity: 'legendary', risk: 95 },
    { name: 'Velocidade Extrema', description: 'Capaz de voar a velocidades supersônicas', type: 'mobilidade', rarity: 'uncommon', risk: 40 },
    { name: 'Camuflagem', description: 'Se mistura perfeitamente com o ambiente', type: 'furtividade', rarity: 'common', risk: 25 },
    { name: 'Raio Congelante', description: 'Congela tudo em um raio de 30 metros', type: 'elemental', rarity: 'epic', risk: 80 },
    { name: 'Escudo de Energia', description: 'Cria barreiras de energia defensivas', type: 'defensivo', rarity: 'rare', risk: 55 },
    { name: 'Manipulação de Vento', description: 'Controla correntes de ar e cria turbilhões', type: 'elemental', rarity: 'rare', risk: 60 },
    { name: 'Telecinese', description: 'Move objetos com o poder da mente', type: 'psíquico', rarity: 'rare', risk: 65 },
    { name: 'Regeneração', description: 'Cura ferimentos rapidamente', type: 'suporte', rarity: 'uncommon', risk: 50 },
    { name: 'Manipulação de Terra', description: 'Controla o solo e cria obstáculos', type: 'elemental', rarity: 'rare', risk: 70 },
    { name: 'Sussurro Mental', description: 'Comunica-se telepaticamente', type: 'psíquico', rarity: 'common', risk: 15 },
    { name: 'Manipulação de Plasma', description: 'Gera e controla plasma energético', type: 'energia', rarity: 'rare', risk: 45 },
    { name: 'Reflexos Ultrarrápidos', description: 'Reage em velocidades sobre-humanas', type: 'mobilidade', rarity: 'epic', risk: 72 },
    { name: 'Criação de Barreiras', description: 'Gera campos de força protetores', type: 'defensivo', rarity: 'uncommon', risk: 30 },
    { name: 'Aniquilação Molecular', description: 'Desintegra matéria ao nível atômico', type: 'bélico', rarity: 'legendary', risk: 88 },
    { name: 'Biorregeneração', description: 'Regenera tecidos danificados rapidamente', type: 'suporte', rarity: 'uncommon', risk: 35 },
    { name: 'Control de Calor', description: 'Absorve e libera energia térmica', type: 'elemental', rarity: 'rare', risk: 52 },
  ]
  
  // Select random location
  const location = locations[Math.floor(Math.random() * locations.length)]
  
  // Select random status
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  // Generate random attributes
  const height = Math.floor(Math.random() * (150 - 60) + 60) // 60-150 cm
  const weight = Math.floor(Math.random() * (4500 - 1800) + 1800) // 1800-4500 g
  const mutations = Math.floor(Math.random() * 25) // 0-24 mutations
  const precision = Math.floor(Math.random() * (25 - 8) + 8) // 8-25 cm
  
  // Random heart rate based on status
  let heartRate = null
  if (status === 'trance') {
    heartRate = Math.floor(Math.random() * (60 - 40) + 40)
  } else if (status === 'deep-hibernation') {
    heartRate = Math.floor(Math.random() * (15 - 5) + 5)
  }
  
  // 70% chance of having a superpower
  const hasSuperpower = Math.random() > 0.3
  let superpowerData = null
  
  if (hasSuperpower) {
    const superpower = superpowers[Math.floor(Math.random() * superpowers.length)]
    superpowerData = superpower
  }
  
  // Generate serial number based on current date
  const now = new Date()
  const year = now.getFullYear()
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return {
    droneSerial: drone.serial || `DR-${year}-${randomNum}`,
    droneBrand: drone.brand,
    droneManufacturer: drone.manufacturer,
    droneCountry: drone.country,
    height,
    weight,
    locationCity: location.city,
    locationCountry: location.country,
    gpsLat: location.lat + (Math.random() - 0.5) * 0.1, // Add some randomness
    gpsLon: location.lon + (Math.random() - 0.5) * 0.1,
    precision,
    referencePoint: location.reference,
    status,
    heartRate,
    mutations,
    superpowerName: superpowerData?.name || null,
    superpowerDescription: superpowerData?.description || null,
    superpowerType: superpowerData?.type || null,
    superpowerRarity: superpowerData?.rarity || null,
    superpowerRisk: superpowerData?.risk || null
  }
}

// Transform database structure to frontend structure
function transformDbToFrontend(duck) {
  return {
    id: String(duck.id),
    drone: {
      serial: duck.droneSerial,
      brand: duck.droneBrand,
      manufacturer: duck.droneManufacturer,
      country: duck.droneCountry
    },
    height: duck.height,
    weight: duck.weight,
    location: {
      city: duck.locationCity,
      country: duck.locationCountry,
      gps: {
        lat: duck.gpsLat,
        lon: duck.gpsLon
      },
      precision: duck.precision,
      referencePoint: duck.referencePoint
    },
    status: duck.status,
    heartRate: duck.heartRate,
    mutations: duck.mutations || 0,
    superpower: duck.superpowerName ? {
      name: duck.superpowerName,
      description: duck.superpowerDescription,
      classification: {
        type: duck.superpowerType,
        rarity: duck.superpowerRarity,
        risk: duck.superpowerRisk
      }
    } : null,
    isCaptured: duck.isCaptured || false,
    capturedAt: duck.capturedAt,
    registeredAt: duck.registeredAt,
    createdAt: duck.createdAt,
    updatedAt: duck.updatedAt
  }
}

// Transform frontend data structure to database structure
function transformFrontendToDb(data) {
  // Helper function to get value from nested structure or top level with fallback
  const getValue = (nestedValue, topLevelValue, defaultValue = 'Unknown') => {
    const value = nestedValue !== undefined && nestedValue !== null && nestedValue !== '' 
      ? nestedValue 
      : (topLevelValue !== undefined && topLevelValue !== null && topLevelValue !== ''
          ? topLevelValue
          : defaultValue)
    return value
  }
  
  const droneSerial = getValue(data.drone?.serial, data.droneSerial, `DR-${Date.now()}`)
  const droneBrand = getValue(data.drone?.brand, data.droneBrand)
  const droneManufacturer = getValue(data.drone?.manufacturer, data.droneManufacturer)
  const droneCountry = getValue(data.drone?.country, data.droneCountry)
  const locationCity = getValue(data.location?.city, data.locationCity)
  const locationCountry = getValue(data.location?.country, data.locationCountry)
  
  return {
    droneSerial,
    droneBrand,
    droneManufacturer,
    droneCountry,
    height: data.height,
    weight: data.weight,
    locationCity,
    locationCountry,
    gpsLat: data.location?.gps?.lat !== undefined && data.location?.gps?.lat !== null 
      ? data.location.gps.lat 
      : (data.gpsLat !== undefined ? data.gpsLat : 0),
    gpsLon: data.location?.gps?.lon !== undefined && data.location?.gps?.lon !== null 
      ? data.location.gps.lon 
      : (data.gpsLon !== undefined ? data.gpsLon : 0),
    precision: data.location?.precision !== undefined ? data.location.precision : data.precision,
    referencePoint: data.location?.referencePoint || data.referencePoint || null,
    status: data.status || 'awake',
    heartRate: data.heartRate !== undefined ? data.heartRate : null,
    mutations: data.mutations || 0,
    superpowerName: data.superpower?.name || data.superpowerName,
    superpowerDescription: data.superpower?.description || data.superpowerDescription,
    superpowerType: data.superpower?.classification?.type || data.superpowerType,
    superpowerRarity: data.superpower?.classification?.rarity || data.superpowerRarity,
    superpowerRisk: data.superpower?.classification?.risk !== undefined 
      ? data.superpower.classification.risk 
      : data.superpowerRisk
  }
}

export default router

