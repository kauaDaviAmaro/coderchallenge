<script setup>
import '../assets/css/fight.css'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { primordialDucks, getDuck, markAsCaptured, loadDucks, calculateRiskLevel, calculateMilitaryPowerNeeded } from '../stores/ducks.js'
import { drones, loadDrones, deleteDrone } from '../stores/drones.js'

const route = useRoute()
const router = useRouter()

const duckId = route.params.duckId || route.query.duckId
const selectedDuck = ref(null)
const selectedDrone = ref(null)
const availableDrones = ref([])

// Fight state
const fightStarted = ref(false)
const fightEnded = ref(false)
const winner = ref(null)
const battleLog = ref([])
const turn = ref(0)
const battleMode = ref('automatic') // 'automatic' or 'manual'
const waitingForManualInput = ref(false)
const pendingAction = ref(null) // Action selected by player in manual mode
const awaitingAction = ref(false) // True when waiting for player to select an action

// Drone resources
const droneBattery = ref(100)
const droneFuel = ref(100)
const droneIntegrity = ref(100)
const droneAltitude = ref(0)

// Duck stats
const duckHealth = ref(0)
const duckWeakness = ref(null)
const attackStrategy = ref(null)

// Flight phase
const inFlightPhase = ref(true)
const flightComplete = ref(false)

onMounted(async () => {
  await loadDrones()
  await loadDucks() // Load ducks from API
  availableDrones.value = drones.value.filter(d => d.status === 'active')
  
  console.log('Looking for duck with ID:', duckId)
  console.log('Available ducks:', primordialDucks.value.map(d => ({ id: d.id, isCaptured: d.isCaptured })))
  
  const duck = getDuck(duckId) || primordialDucks.value.find(d => d.id == duckId)
  if (duck) {
    console.log('Found duck:', duck.id, duck.isCaptured)
    selectedDuck.value = duck
    duckHealth.value = getDuckHealth(duck)
    duckWeakness.value = analyzeWeakness(duck)
    attackStrategy.value = determineStrategy(duck)
  } else {
    console.error('Duck not found with ID:', duckId)
  }
  
  if (availableDrones.value.length > 0) {
    selectedDrone.value = availableDrones.value[0]
  }
})

const getDuckHealth = (duck) => {
  const risk = calculateRiskLevel(duck)
  
  // Base health scales with risk: 50-120 HP
  const baseHealth = 50 + (risk * 0.7)
  
  // Mutations add small bonus
  const mutations = (duck.mutations || 0) * 2
  
  // Superpower adds moderate bonus
  const powerMultiplier = duck.superpower ? getSuperpowerMultiplier(duck.superpower.classification?.rarity) : 1
  const powerBonus = (powerMultiplier - 1) * 10
  
  return Math.floor(baseHealth + mutations + powerBonus)
}

const getSuperpowerMultiplier = (rarity) => {
  const multipliers = {
    'legendary': 1.8,
    'epic': 1.5,
    'rare': 1.3,
    'uncommon': 1.15,
    'common': 1.0
  }
  return multipliers[rarity] || 1.0
}

// Analyze duck's weakness
const analyzeWeakness = (duck) => {
  const weaknesses = []
  
  // Analyze by size
  if (duck.height > 150) {
    weaknesses.push({
      type: 'size',
      description: 'Alvo muito alto - vulnerável a ataques por cima',
      weakness: 'overhead'
    })
  }
  
  if (duck.weight > 5000) {
    weaknesses.push({
      type: 'weight',
      description: 'Peso elevado - lento em mudanças de direção',
      weakness: 'agility'
    })
  }
  
  // Analyze by status
  if (duck.status === 'deep-hibernation') {
    weaknesses.push({
      type: 'status',
      description: 'Hibernação profunda - reação lenta',
      weakness: 'reaction'
    })
  }
  
  // Analyze by mutations
  if ((duck.mutations || 0) > 5) {
    weaknesses.push({
      type: 'mutation',
      description: 'Múltiplas mutações - instabilidade genética',
      weakness: 'instability'
    })
  }
  
  // Analyze by superpower
  if (duck.superpower) {
    const powerName = duck.superpower.name?.toLowerCase() || ''
    
    if (powerName.includes('fire') || powerName.includes('fogo')) {
      weaknesses.push({
        type: 'superpower',
        description: 'Controle de fogo - fraco contra água',
        weakness: 'water'
      })
    } else if (powerName.includes('ice') || powerName.includes('gelo')) {
      weaknesses.push({
        type: 'superpower',
        description: 'Controle de gelo - fraco contra calor',
        weakness: 'heat'
      })
    } else if (powerName.includes('teleport') || powerName.includes('teletransporte')) {
      weaknesses.push({
        type: 'superpower',
        description: 'Teletransporte - pode ser interrompido com interferência',
        weakness: 'interference'
      })
    } else if (powerName.includes('mind') || powerName.includes('mente')) {
      weaknesses.push({
        type: 'superpower',
        description: 'Controle mental - vulnerável a distrações',
        weakness: 'distraction'
      })
    } else {
      weaknesses.push({
        type: 'superpower',
        description: 'Superpoder ativo - requer defesa especializada',
        weakness: 'specialized'
      })
    }
  }
  
  return weaknesses.length > 0 ? weaknesses[0] : {
    type: 'none',
    description: 'Nenhuma fraqueza óbvia detectada',
    weakness: 'none'
  }
}

// Determine attack strategy
const determineStrategy = (duck) => {
  if (duck.height > 100) {
    return {
      type: 'overhead',
      name: 'Ataque Aéreo Superior',
      description: 'Drone voa acima do alvo e lança projéteis',
      damageMultiplier: 1.5
    }
  }
  
  if (duck.status === 'deep-hibernation') {
    return {
      type: 'surprise',
      name: 'Ataque Surpresa',
      description: 'Aproximação silenciosa com ataque rápido',
      damageMultiplier: 1.3
    }
  }
  
  if ((duck.mutations || 0) > 3) {
    return {
      type: 'genetic',
      name: 'Ataque Genético',
      description: 'Foca nas instabilidades genéticas',
      damageMultiplier: 1.4
    }
  }
  
  return {
    type: 'standard',
    name: 'Ataque Padrão',
    description: 'Combate direto',
    damageMultiplier: 1.0
  }
}

// Generate random defense
const generateRandomDefense = (duckWeakness) => {
  const defenses = {
    'overhead': [
      '🪨 Lançando pedras do alto!',
      '💣 Dropando explosivos!',
      '🛸 Bombardeio vertical!'
    ],
    'water': [
      '🚰 Crianças da festa lançam super soakers!',
      '💧 Sistema de sprinklers ativado!',
      '🌊 Mangueira de alta pressão acionada!'
    ],
    'heat': [
      '🔥 Frigideiras quentes do churrasco!',
      '☀️ Lentes solares concentrando raios!',
      '♨️ Vapor super aquecido!'
    ],
    'chocolate': [
      '🍫 Crianças atirando brigadeiros!',
      '🍰 Chocolate derretido em jatos!',
      '🧁 Cupcakes com confete de chocolate!'
    ],
    'distraction': [
      '📣 Buzinas de festa ativadas!',
      '🎊 Fogos de artifício!',
      '🎉 Balões barulhentos explodindo!'
    ],
    'interference': [
      '📡 Interferência eletromagnética ativada!',
      '🔊 Pulso sonoro disruptivo!',
      '⚡ Campo de interferência gerado!'
    ],
    'specialized': [
      '🛡️ Escudos de energia ativados!',
      '🔬 Contramedidas biológicas!',
      '🧪 Inibidores de superpoder!'
    ],
    'reaction': [
      '⚡ Ataque de velocidade extrema!',
      '💨 Movimentação rápida!',
      '🎯 Precisão cirúrgica!'
    ],
    'agility': [
      '🎯 Ataques em séries rápidas!',
      '🔄 Movimentos imprevisíveis!',
      '⚡ Combos consecutivos!'
    ],
    'instability': [
      '🧬 Disruptores genéticos ativados!',
      '🔬 Vacinas anti-mutação!',
      '💉 Inibidores de mutação!'
    ],
    'none': [
      '💪 Ataque direto e potente!',
      '⚔️ Combate corpo a corpo!',
      '🎯 Táticas ofensivas padrão!'
    ]
  }
  
  const list = defenses[duckWeakness?.weakness || 'none'] || defenses['none']
  return list[Math.floor(Math.random() * list.length)]
}

const getDroneDamage = (drone) => {
  const baseDamage = 25
  const modelBonus = parseFloat(drone.model) || 1
  const strategyBonus = attackStrategy.value?.damageMultiplier || 1
  
  // Action multiplier if in manual mode
  const actionMultiplier = pendingAction.value?.damageMultiplier || 1
  
  // Resources affect damage: 50% base + up to 50% from resources
  const resourceFactor = (droneBattery.value + droneFuel.value + droneIntegrity.value) / 300
  const effectiveDamage = baseDamage * modelBonus * strategyBonus * actionMultiplier * (0.5 + resourceFactor * 0.5)
  
  return Math.floor(effectiveDamage)
}

const getDuckDamage = (duck) => {
  const baseDamage = 12
  const risk = calculateRiskLevel(duck)
  const mutations = duck.mutations || 0
  
  // Damage based on risk (scales from baseDamage to baseDamage * 1.7)
  const riskDamage = baseDamage + (risk * 0.15)
  
  // Mutations add small bonus
  const mutationBonus = mutations * 1.5
  
  // Superpower adds moderate bonus
  const powerMultiplier = duck.superpower ? getSuperpowerMultiplier(duck.superpower.classification?.rarity) : 1
  const powerDamage = (powerMultiplier - 1) * 5
  
  return Math.floor(riskDamage + mutationBonus + powerDamage)
}

const getDroneResourceConsumption = () => {
  const baseConsumption = 2
  const altitudeFactor = droneAltitude.value / 100
  return {
    battery: Math.max(1, baseConsumption * (1 - altitudeFactor * 0.3)),
    fuel: Math.max(1, baseConsumption * 1.2),
    integrity: Math.random() < 0.1 ? Math.floor(Math.random() * 5) : 0
  }
}

const startFlightPhase = () => {
  if (!selectedDuck.value || !selectedDrone.value) {
    alert('Por favor, selecione um drone!')
    return
  }
  
  addLog(`=== FASE DE VOO INICIADA ===`)
  addLog(`Drone: ${selectedDrone.value.serial} decolando...`)
  addLog(`Destino: Combatendo Pato #${selectedDuck.value.id.substring(0, 8)}`)
  addLog('')
  
  performFlightPhase()
}

const performFlightPhase = async () => {
  for (let i = 0; i < 10; i++) {
    await delay(300)
    
    const progress = (i + 1) * 10
    droneAltitude.value = progress
    droneBattery.value = Math.max(0, droneBattery.value - 0.5)
    droneFuel.value = Math.max(0, droneFuel.value - 0.8)
    
    if (i < 9) {
      addLog(`Altura: ${progress}m | Bateria: ${droneBattery.value.toFixed(1)}% | Combustível: ${droneFuel.value.toFixed(1)}%`)
    }
  }
  
  flightComplete.value = true
  inFlightPhase.value = false
  
  addLog('')
  addLog('✓ Drone sobrevoando o alvo!')
  addLog('Sistemas de combate prontos!')
  addLog('')
  
  await delay(500)
  startFight()
}

const startFight = () => {
  fightStarted.value = true
  fightEnded.value = false
  winner.value = null
  
  addLog(`=== LUTA INICIADA ===`)
  addLog(`Modo de Batalha: ${battleMode.value === 'automatic' ? '🔄 AUTOMÁTICO' : '🎮 MANUAL'}`)
  addLog(`Estratégia: ${attackStrategy.value?.name || 'Padrão'}`)
  addLog(`Análise de Fraqueza: ${duckWeakness.value?.description || 'Nenhuma'}`)
  addLog(`Vida do Drone: ${droneIntegrity.value}%`)
  addLog(`Vida do Pato: ${duckHealth.value}%`)
  addLog('')
  
  if (battleMode.value === 'manual') {
    waitingForManualInput.value = true
    addLog(`[MODO MANUAL] Aguardando ação do operador para iniciar...`)
  } else {
    waitingForManualInput.value = false
  }
  
  performFight()
}

const performFight = async () => {
  while (!fightEnded.value && turn.value < 50) {
    // In manual mode, if we're waiting for turn input, break and wait
    if (battleMode.value === 'manual' && waitingForManualInput.value) {
      break
    }
    
    // In manual mode, if we're waiting for action selection, break and wait
    if (battleMode.value === 'manual' && awaitingAction.value) {
      break
    }
    
    // Only increment turn at the start of a new turn
    const isNewTurn = !(battleMode.value === 'manual' && pendingAction.value !== null)
    
    if (isNewTurn) {
      turn.value++
      
      // Check drone resources
      const resources = getDroneResourceConsumption()
      droneBattery.value = Math.max(0, droneBattery.value - resources.battery)
      droneFuel.value = Math.max(0, droneFuel.value - resources.fuel)
      droneIntegrity.value = Math.max(0, droneIntegrity.value - resources.integrity)
      
      addLog(`--- TURNO ${turn.value} ---`)
      addLog(`Recursos: Bateria ${droneBattery.value.toFixed(1)}% | Combustível ${droneFuel.value.toFixed(1)}% | Integridade ${droneIntegrity.value.toFixed(1)}%`)
      
      // Check if drone lost resources
      if (droneBattery.value <= 0 || droneFuel.value <= 0) {
        winner.value = 'duck'
        fightEnded.value = true
        addLog('')
        addLog('🔋 Drone sem recursos! DERROTA!')
        
        // Delete the destroyed drone
        if (selectedDrone.value && selectedDrone.value.id) {
          try {
            await deleteDrone(selectedDrone.value.id)
            addLog('🗑️ Drone removido do sistema')
          } catch (error) {
            console.error('Error deleting drone:', error)
          }
        }
        break
      }
      
      if (droneIntegrity.value <= 0) {
        winner.value = 'duck'
        fightEnded.value = true
        addLog('')
        addLog('💥 Drone destruído! DERROTA!')
        
        // Delete the destroyed drone
        if (selectedDrone.value && selectedDrone.value.id) {
          try {
            await deleteDrone(selectedDrone.value.id)
            addLog('🗑️ Drone destruído e removido do sistema')
          } catch (error) {
            console.error('Error deleting drone:', error)
          }
        }
        break
      }
      
      await delay(400)
      
      // In manual mode, wait for action selection
      if (battleMode.value === 'manual' && !fightEnded.value) {
        awaitingAction.value = true
        pendingAction.value = null
        addLog('')
        addLog('[ESCOLHA SUA AÇÃO]')
        break
      }
    }
    
    // Use selected action or default automatic action
    const currentAction = pendingAction.value || availableActions[0]
    
    // Apply action resource costs
    if (currentAction && battleMode.value === 'manual' && pendingAction.value) {
      droneBattery.value = Math.max(0, droneBattery.value - currentAction.batteryCost)
      droneFuel.value = Math.max(0, droneFuel.value - currentAction.fuelCost)
      addLog(`[CONSUMO] Bateria -${currentAction.batteryCost}% | Combustível -${currentAction.fuelCost}%`)
    }
    
    // Drone attacks
    const defenseMsg = generateRandomDefense(duckWeakness.value)
    addLog(`[DEFESA] ${defenseMsg}`)
    await delay(300)
    
    const droneDamage = getDroneDamage(selectedDrone.value)
    duckHealth.value = Math.max(0, duckHealth.value - droneDamage)
    
    const actionName = pendingAction.value?.name || attackStrategy.value?.name || 'Ataque'
    addLog(`[DRONE] ${actionName} - ${droneDamage} de dano!`)
    addLog(`Vida do Pato: ${duckHealth.value}%`)
    
    if (duckHealth.value <= 0) {
      winner.value = 'drone'
      fightEnded.value = true
      addLog('')
      addLog('🏆 VITÓRIA DO DRONE!')
      addLog('Pato capturado com sucesso!')
      console.log('Capturing duck with ID:', selectedDuck.value.id)
      const result = await markAsCaptured(selectedDuck.value.id)
      console.log('Capture result:', result)
      setTimeout(() => router.push('/captured'), 3000)
      break
    }
    
    await delay(400)
    
    // Duck counter-attack
    const duckDamage = getDuckDamage(selectedDuck.value)
    
    // Apply defensive bonus if defensive action was used
    let finalDuckDamage = duckDamage
    if (pendingAction.value && pendingAction.value.defensiveBonus) {
      finalDuckDamage = Math.floor(duckDamage * pendingAction.value.defensiveBonus)
      addLog(`[DEFESA ATIVA] Reduziu ${duckDamage - finalDuckDamage} de dano!`)
    }
    
    if (selectedDuck.value.superpower) {
      addLog(`[PATO] ${selectedDuck.value.superpower.name} ativado!`)
    }
    
    droneIntegrity.value = Math.max(0, droneIntegrity.value - finalDuckDamage)
    addLog(`[PATO] Contra-ataque - ${finalDuckDamage} de dano!`)
    addLog(`Integridade do Drone: ${droneIntegrity.value.toFixed(1)}%`)
    
    if (droneIntegrity.value <= 0) {
      winner.value = 'duck'
      fightEnded.value = true
      addLog('')
      addLog('💥 DERROTA! Drone danificado!')
      
      // Delete the destroyed drone
      if (selectedDrone.value && selectedDrone.value.id) {
        try {
          await deleteDrone(selectedDrone.value.id)
          addLog('🗑️ Drone destruído e removido do sistema')
        } catch (error) {
          console.error('Error deleting drone:', error)
        }
      }
      break
    }
    
    // Clear pending action
    pendingAction.value = null
    
    addLog('')
    
    // Delay before next turn
    await delay(500)
    
    // In manual mode, set waiting flag for user input
    if (battleMode.value === 'manual' && !fightEnded.value) {
      waitingForManualInput.value = true
      addLog(`[MODO MANUAL] Aguardando ação do operador...`)
      break
    }
  }
  
  if (turn.value >= 50 && !fightEnded.value) {
    fightEnded.value = true
    winner.value = 'draw'
    addLog('')
    addLog('⚖️ EMPATE! Limite de turnos atingido.')
  }
}

const nextTurn = async () => {
  if (waitingForManualInput.value && !fightEnded.value) {
    waitingForManualInput.value = false
    await performFight()
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Available actions for manual mode
const availableActions = [
  {
    id: 'direct_attack',
    name: '⚔️ Ataque Direto',
    description: 'Ataque frontal com dano moderado',
    damageMultiplier: 1.0,
    batteryCost: 2,
    fuelCost: 2,
    icon: '⚔️'
  },
  {
    id: 'power_attack',
    name: '💥 Ataque Poderoso',
    description: 'Ataque forte que consome mais recursos',
    damageMultiplier: 1.5,
    batteryCost: 5,
    fuelCost: 4,
    icon: '💥'
  },
  {
    id: 'precise_attack',
    name: '🎯 Ataque Preciso',
    description: 'Ataque focado na fraqueza do alvo',
    damageMultiplier: 1.3,
    batteryCost: 3,
    fuelCost: 3,
    icon: '🎯'
  },
  {
    id: 'rapid_attack',
    name: '⚡ Ataque Rápido',
    description: 'Ataque rápido com pouco consumo',
    damageMultiplier: 0.8,
    batteryCost: 1,
    fuelCost: 1,
    icon: '⚡'
  },
  {
    id: 'defensive',
    name: '🛡️ Defensivo',
    description: 'Postura defensiva, reduz dano recebido',
    damageMultiplier: 0.5,
    batteryCost: 1,
    fuelCost: 1,
    defensiveBonus: 0.7,
    icon: '🛡️'
  }
]

const selectAction = async (action) => {
  if (awaitingAction.value && !fightEnded.value) {
    pendingAction.value = action
    awaitingAction.value = false
    addLog(`[AÇÃO SELECIONADA] ${action.name}`)
    // Continue the fight with the selected action
    setTimeout(() => {
      performFight()
    }, 100)
  }
}

const addLog = (message) => {
  battleLog.value.push({
    turn: turn.value,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
  setTimeout(() => {
    const logContainer = document.querySelector('.battle-log')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, 100)
}

const goBack = () => router.push('/capture')

const getStatusLabel = (status) => {
  const labels = {
    'awake': 'Acordado',
    'trance': 'Transe',
    'deep-hibernation': 'Hibernação Profunda'
  }
  return labels[status] || status
}

const getResourceColor = (value) => {
  if (value > 60) return '#22c55e'
  if (value > 30) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <div class="fight-container">
    <div class="grid-overlay"></div>
    
    <div class="fight-header">
      <h1 class="fight-title">⚔️ COMBATE PRIMORDIAL</h1>
      <p class="fight-subtitle">Sistema Avançado de Captura - Missão 3ª</p>
    </div>

    <!-- Flight Phase -->
    <div v-if="inFlightPhase && !flightComplete" class="flight-section">
      <div class="flight-card">
        <div class="flight-header">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h2>FASE DE VOO</h2>
        </div>
        
        <!-- Battle Mode Selection -->
        <div class="mode-selection-section" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
          <label class="drone-select-label">Modo de Batalha:</label>
          <div style="display: flex; gap: 15px; margin-top: 10px;">
            <button 
              @click="battleMode = 'automatic'" 
              :class="battleMode === 'automatic' ? 'btn-mode-active' : 'btn-mode-inactive'"
              style="flex: 1; padding: 10px; background: rgba(34, 197, 94, 0.2); border: 2px solid #22c55e; color: #fff; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
              :style="battleMode === 'automatic' ? { background: '#22c55e', border: '2px solid #22c55e', transform: 'scale(1.05)' } : {}"
            >
              🔄 AUTOMÁTICO
            </button>
            <button 
              @click="battleMode = 'manual'" 
              :class="battleMode === 'manual' ? 'btn-mode-active' : 'btn-mode-inactive'"
              style="flex: 1; padding: 10px; background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; color: #fff; border-radius: 8px; cursor: pointer; transition: all 0.3s;"
              :style="battleMode === 'manual' ? { background: '#3b82f6', border: '2px solid #3b82f6', transform: 'scale(1.05)' } : {}"
            >
              🎮 MANUAL
            </button>
          </div>
          <p style="margin-top: 10px; font-size: 0.85em; color: #a0a0a0;">
            {{ battleMode === 'automatic' ? 'A batalha ocorrerá automaticamente' : 'Você controlará cada turno manualmente' }}
          </p>
        </div>
        
        <!-- Drone Selection -->
        <div class="drone-selection-section">
          <label class="drone-select-label">Selecione o Drone para a Missão:</label>
          <select v-model="selectedDrone" class="drone-select">
            <option v-for="drone in availableDrones" :key="drone.id" :value="drone">
              {{ drone.serial }} - {{ drone.brand }} {{ drone.model }}
            </option>
          </select>
        </div>

        <!-- Drone Details -->
        <div v-if="selectedDrone" class="drone-preview-section">
          <h3>Dados do Drone Selecionado:</h3>
          <div class="drone-info-grid">
            <div class="info-item">
              <span class="info-label">Serial:</span>
              <span class="info-value">{{ selectedDrone.serial }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Marca:</span>
              <span class="info-value">{{ selectedDrone.brand }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Modelo:</span>
              <span class="info-value">{{ selectedDrone.model }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fabricante:</span>
              <span class="info-value">{{ selectedDrone.manufacturer }}</span>
            </div>
          </div>
        </div>

        
        <div class="action-buttons">
          <button @click="goBack" class="btn-secondary">Cancelar</button>
          <button 
            @click="startFlightPhase" 
            class="btn-start"
            :disabled="!selectedDrone || availableDrones.length === 0"
          >
            INICIAR VOO
          </button>
        </div>
      </div>
    </div>

    <!-- Fight Phase -->
    <div v-else-if="!inFlightPhase || fightStarted" class="fighters-section">
      <!-- Duck Info -->
      <div class="fighter-card duck-fighter">
        <div class="fighter-header">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <h2>PATO PRIMORDIAL</h2>
        </div>
        
        <div v-if="selectedDuck" class="fighter-info">
          <div class="info-row">
            <span class="info-label">ID:</span>
            <span class="info-value">{{ selectedDuck.id.substring(0, 8) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">{{ getStatusLabel(selectedDuck.status) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Altura:</span>
            <span class="info-value">{{ (selectedDuck.height / 100).toFixed(2) }}m</span>
          </div>
          <div class="info-row">
            <span class="info-label">Peso:</span>
            <span class="info-value">{{ (selectedDuck.weight / 1000).toFixed(2) }}kg</span>
          </div>
          <div class="info-row">
            <span class="info-label">Mutações:</span>
            <span class="info-value">{{ selectedDuck.mutations || 0 }}</span>
          </div>
          <div v-if="selectedDuck.superpower" class="info-row">
            <span class="info-label">Superpoder:</span>
            <span class="info-value superpower-name">{{ selectedDuck.superpower.name }}</span>
          </div>
          
          <div v-if="duckWeakness" class="weakness-section">
            <div class="weakness-label">🔍 Fraqueza Detectada:</div>
            <div class="weakness-value">{{ duckWeakness.description }}</div>
          </div>
          
          <div v-if="fightStarted" class="health-bar-container">
            <div class="health-bar-label">Vida</div>
            <div class="health-bar">
              <div 
                class="health-fill duck-health" 
                :style="{ width: duckHealth + '%' }"
              >
                {{ duckHealth }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VS Divider -->
      <div class="vs-divider">
        <div class="vs-circle">VS</div>
      </div>

      <!-- Drone Selection & Status -->
      <div class="fighter-card drone-fighter">
        <div class="fighter-header">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h2>DRONE</h2>
        </div>
        
        <div class="fighter-info">
          <div v-if="!fightStarted" class="drone-selector">
            <label class="info-label">Selecione o Drone:</label>
            <select v-model="selectedDrone" class="drone-select">
              <option v-for="drone in availableDrones" :key="drone.id" :value="drone">
                {{ drone.serial }} - {{ drone.brand }} {{ drone.model }}
              </option>
            </select>
          </div>
          
          <div v-if="selectedDrone && !fightStarted" class="drone-details">
            <div class="info-row">
              <span class="info-label">Serial:</span>
              <span class="info-value">{{ selectedDrone.serial }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Marca:</span>
              <span class="info-value">{{ selectedDrone.brand }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Modelo:</span>
              <span class="info-value">{{ selectedDrone.model }}</span>
            </div>
          </div>
          
          <div v-if="attackStrategy && !fightStarted" class="strategy-section">
            <div class="strategy-label">📋 Estratégia:</div>
            <div class="strategy-name">{{ attackStrategy.name }}</div>
            <div class="strategy-desc">{{ attackStrategy.description }}</div>
          </div>
          
          <div v-if="(fightStarted || flightComplete) && selectedDrone" class="drone-resources">
            <div class="resource-item">
              <div class="resource-header">
                <span>Integridade</span>
                <span :style="{ color: getResourceColor(droneIntegrity) }">
                  {{ droneIntegrity.toFixed(1) }}%
                </span>
              </div>
              <div class="resource-bar">
                <div 
                  class="resource-fill" 
                  :class="{ low: droneIntegrity < 30 }"
                  :style="{ width: droneIntegrity + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="resource-item">
              <div class="resource-header">
                <span>Bateria</span>
                <span :style="{ color: getResourceColor(droneBattery) }">
                  {{ droneBattery.toFixed(1) }}%
                </span>
              </div>
              <div class="resource-bar">
                <div 
                  class="resource-fill battery" 
                  :class="{ low: droneBattery < 30 }"
                  :style="{ width: droneBattery + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="resource-item">
              <div class="resource-header">
                <span>Combustível</span>
                <span :style="{ color: getResourceColor(droneFuel) }">
                  {{ droneFuel.toFixed(1) }}%
                </span>
              </div>
              <div class="resource-bar">
                <div 
                  class="resource-fill fuel" 
                  :class="{ low: droneFuel < 30 }"
                  :style="{ width: droneFuel + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Battle Log and Actions Side by Side -->
    <div v-if="fightStarted && !inFlightPhase">
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        
        <!-- Action Selection (Manual Mode) - Left Side -->
        <div 
          v-if="awaitingAction && battleMode === 'manual' && fightStarted && !fightEnded"
          style="width: 380px; flex-shrink: 0; padding: 20px; background: rgba(0,0,0,0.4); border-radius: 12px; border: 2px solid #3b82f6;"
        >
          <h3 style="margin: 0 0 15px 0; color: #3b82f6; font-size: 1.2em;">🎮 ESCOLHA SUA AÇÃO</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button
              v-for="action in availableActions"
              :key="action.id"
              @click="selectAction(action)"
              style="padding: 15px; background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; border-radius: 8px; cursor: pointer; transition: all 0.3s; text-align: left;"
              class="action-btn"
              @mouseenter="(e) => e.target.style.background='rgba(59, 130, 246, 0.4)'"
              @mouseleave="(e) => e.target.style.background='rgba(59, 130, 246, 0.2)'"
            >
              <div style="font-size: 1.3em; margin-bottom: 5px;">{{ action.icon }}</div>
              <div style="font-weight: bold; color: white; margin-bottom: 5px;">{{ action.name }}</div>
              <div style="font-size: 0.85em; color: #a0a0a0; margin-bottom: 8px;">{{ action.description }}</div>
              <div style="font-size: 0.75em; color: #6b7280;">
                <div>⚡ Bateria: -{{ action.batteryCost }}%</div>
                <div>⛽ Combustível: -{{ action.fuelCost }}%</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Battle Log - Always shown on right side -->
        <div class="battle-log-section" style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">📜 Sistema de Controle e Log</h3>
            <div style="padding: 8px 16px; background: rgba(0,0,0,0.3); border-radius: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.9em;">Modo:</span>
              <span :style="{ fontWeight: 'bold', color: battleMode === 'automatic' ? '#22c55e' : '#3b82f6' }">
                {{ battleMode === 'automatic' ? '🔄 AUTOMÁTICO' : '🎮 MANUAL' }}
              </span>
            </div>
          </div>
          <div class="battle-log">
            <div 
              v-for="(log, index) in battleLog" 
              :key="index" 
              class="log-entry"
            >
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Actions -->
    <div class="action-buttons">
      <!-- Manual mode "Next Turn" button -->
      <button 
        v-if="battleMode === 'manual' && fightStarted && !fightEnded && waitingForManualInput"
        @click="nextTurn" 
        class="btn-next-turn"
        style="padding: 12px 30px; font-size: 1.1em; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold; transition: all 0.3s; animation: pulse 2s infinite;"
      >
        ⏭️ PRÓXIMO TURNO
      </button>
      
      <button @click="goBack" class="btn-secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Voltar
      </button>
      
      <button 
        v-if="fightEnded && winner === 'drone'" 
        @click="router.push('/captured')" 
        class="btn-success"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Ver Capturados
      </button>
      
      <button 
        v-if="fightEnded && (winner === 'duck' || winner === 'draw')" 
        @click="goBack" 
        class="btn-retry"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Nova Tentativa
      </button>
    </div>
  </div>
</template>