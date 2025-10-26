import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sequelize from './config/database.js'
import Duck from './models/Duck.js'
import Drone from './models/Drone.js'
import ducksRouter from './routes/ducks.js'
import dronesRouter from './routes/drones.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/ducks', ducksRouter)
app.use('/api/drones', dronesRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Primordial Ducks API is running' })
})

// Auto-seed ducks if database is empty
async function autoSeedDucks() {
  try {
    const duckCount = await Duck.count()
    
    if (duckCount === 0) {
      console.log('🌱 No ducks found, seeding sample data...')
      
      const sampleDucks = [
        {
          droneSerial: 'DR-2024-001',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 125,
          weight: 3200,
          locationCity: 'Rio de Janeiro',
          locationCountry: 'Brasil',
          gpsLat: -22.9068,
          gpsLon: -43.1729,
          precision: 15,
          referencePoint: 'Praia de Copacabana',
          status: 'awake',
          mutations: 8,
          superpowerName: 'Bola de Fogo',
          superpowerDescription: 'Capaz de lançar bolas de fogo intensas que atingem até 50 metros de distância',
          superpowerType: 'bélico',
          superpowerRarity: 'rare',
          superpowerRisk: 75
        },
        {
          droneSerial: 'DR-2024-002',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 95,
          weight: 2800,
          locationCity: 'São Paulo',
          locationCountry: 'Brasil',
          gpsLat: -23.5505,
          gpsLon: -46.6333,
          precision: 12,
          referencePoint: 'Parque Ibirapuera',
          status: 'trance',
          heartRate: 45,
          mutations: 12,
          superpowerName: 'Raios Elétricos',
          superpowerDescription: 'Gera descargas elétricas de alta voltagem',
          superpowerType: 'energia',
          superpowerRarity: 'epic',
          superpowerRisk: 85
        },
        {
          droneSerial: 'DR-2024-003',
          droneBrand: 'Parrot',
          droneManufacturer: 'Parrot SA',
          droneCountry: 'França',
          height: 80,
          weight: 2150,
          locationCity: 'Brasília',
          locationCountry: 'Brasil',
          gpsLat: -15.7942,
          gpsLon: -47.8822,
          precision: 10,
          referencePoint: 'Palácio da Alvorada',
          status: 'deep-hibernation',
          heartRate: 8,
          mutations: 3,
          superpowerName: null,
          superpowerDescription: null,
          superpowerType: null,
          superpowerRarity: null,
          superpowerRisk: null
        },
        {
          droneSerial: 'DR-2024-004',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 150,
          weight: 4500,
          locationCity: 'Manaus',
          locationCountry: 'Brasil',
          gpsLat: -3.1190,
          gpsLon: -60.0217,
          precision: 25,
          referencePoint: 'Encontro das Águas',
          status: 'awake',
          mutations: 15,
          superpowerName: 'Control de Águas',
          superpowerDescription: 'Manipula corpos d\'água e cria ondas gigantes',
          superpowerType: 'elemental',
          superpowerRarity: 'legendary',
          superpowerRisk: 95
        },
        {
          droneSerial: 'DR-2024-005',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 110,
          weight: 3500,
          locationCity: 'Salvador',
          locationCountry: 'Brasil',
          gpsLat: -12.9714,
          gpsLon: -38.5014,
          precision: 18,
          referencePoint: 'Pelourinho',
          status: 'trance',
          heartRate: 52,
          mutations: 6,
          superpowerName: 'Velocidade Extrema',
          superpowerDescription: 'Capaz de voar a velocidades supersônicas',
          superpowerType: 'mobilidade',
          superpowerRarity: 'uncommon',
          superpowerRisk: 40
        },
        {
          droneSerial: 'DR-2024-006',
          droneBrand: 'Parrot',
          droneManufacturer: 'Parrot SA',
          droneCountry: 'França',
          height: 65,
          weight: 1800,
          locationCity: 'Curitiba',
          locationCountry: 'Brasil',
          gpsLat: -25.4284,
          gpsLon: -49.2733,
          precision: 8,
          referencePoint: 'Jardim Botânico',
          status: 'awake',
          mutations: 20,
          superpowerName: 'Camuflagem',
          superpowerDescription: 'Se mistura perfeitamente com o ambiente',
          superpowerType: 'furtividade',
          superpowerRarity: 'common',
          superpowerRisk: 25
        },
        {
          droneSerial: 'DR-2024-007',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 140,
          weight: 4100,
          locationCity: 'Fortaleza',
          locationCountry: 'Brasil',
          gpsLat: -3.7319,
          gpsLon: -38.5267,
          precision: 20,
          referencePoint: 'Beira Mar',
          status: 'deep-hibernation',
          heartRate: 5,
          mutations: 5,
          superpowerName: null,
          superpowerDescription: null,
          superpowerType: null,
          superpowerRarity: null,
          superpowerRisk: null
        },
        {
          droneSerial: 'DR-2024-008',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 100,
          weight: 2900,
          locationCity: 'Porto Alegre',
          locationCountry: 'Brasil',
          gpsLat: -30.0346,
          gpsLon: -51.2177,
          precision: 14,
          referencePoint: 'Usina do Gasômetro',
          status: 'awake',
          mutations: 18,
          superpowerName: 'Raio Congelante',
          superpowerDescription: 'Congela tudo em um raio de 30 metros',
          superpowerType: 'elemental',
          superpowerRarity: 'epic',
          superpowerRisk: 80
        },
        {
          droneSerial: 'DR-2024-009',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 105,
          weight: 3100,
          locationCity: 'Recife',
          locationCountry: 'Brasil',
          gpsLat: -8.0476,
          gpsLon: -34.8770,
          precision: 16,
          referencePoint: 'Marco Zero',
          status: 'awake',
          mutations: 9,
          superpowerName: 'Escudo de Energia',
          superpowerDescription: 'Cria barreiras de energia defensivas',
          superpowerType: 'defensivo',
          superpowerRarity: 'rare',
          superpowerRisk: 55
        },
        {
          droneSerial: 'DR-2024-010',
          droneBrand: 'Parrot',
          droneManufacturer: 'Parrot SA',
          droneCountry: 'França',
          height: 88,
          weight: 2400,
          locationCity: 'Belém',
          locationCountry: 'Brasil',
          gpsLat: -1.4558,
          gpsLon: -48.5042,
          precision: 11,
          referencePoint: 'Ver-o-Peso',
          status: 'trance',
          heartRate: 48,
          mutations: 11,
          superpowerName: 'Manipulação de Vento',
          superpowerDescription: 'Controla correntes de ar e cria turbilhões',
          superpowerType: 'elemental',
          superpowerRarity: 'rare',
          superpowerRisk: 60
        },
        {
          droneSerial: 'DR-2024-011',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 120,
          weight: 3800,
          locationCity: 'Goiânia',
          locationCountry: 'Brasil',
          gpsLat: -16.6864,
          gpsLon: -49.2643,
          precision: 19,
          referencePoint: 'Praça Cívica',
          status: 'awake',
          mutations: 13,
          superpowerName: 'Telecinese',
          superpowerDescription: 'Move objetos com o poder da mente',
          superpowerType: 'psíquico',
          superpowerRarity: 'rare',
          superpowerRisk: 65
        },
        {
          droneSerial: 'DR-2024-012',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 92,
          weight: 2700,
          locationCity: 'Vitória',
          locationCountry: 'Brasil',
          gpsLat: -20.3155,
          gpsLon: -40.3128,
          precision: 13,
          referencePoint: 'Ilha do Frade',
          status: 'awake',
          mutations: 7,
          superpowerName: 'Regeneração',
          superpowerDescription: 'Cura ferimentos rapidamente',
          superpowerType: 'suporte',
          superpowerRarity: 'uncommon',
          superpowerRisk: 50
        },
        {
          droneSerial: 'DR-2024-013',
          droneBrand: 'Parrot',
          droneManufacturer: 'Parrot SA',
          droneCountry: 'França',
          height: 115,
          weight: 3600,
          locationCity: 'Natal',
          locationCountry: 'Brasil',
          gpsLat: -5.7936,
          gpsLon: -35.2015,
          precision: 17,
          referencePoint: 'Ponta Negra',
          status: 'trance',
          heartRate: 50,
          mutations: 14,
          superpowerName: 'Manipulação de Terra',
          superpowerDescription: 'Controla o solo e cria obstáculos',
          superpowerType: 'elemental',
          superpowerRarity: 'rare',
          superpowerRisk: 70
        },
        {
          droneSerial: 'DR-2024-014',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 85,
          weight: 2600,
          locationCity: 'Campinas',
          locationCountry: 'Brasil',
          gpsLat: -22.9069,
          gpsLon: -47.0626,
          precision: 14,
          referencePoint: 'Lago do Café',
          status: 'awake',
          mutations: 4,
          superpowerName: 'Sussurro Mental',
          superpowerDescription: 'Comunica-se telepaticamente',
          superpowerType: 'psíquico',
          superpowerRarity: 'common',
          superpowerRisk: 15
        },
        {
          droneSerial: 'DR-2024-015',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 98,
          weight: 2950,
          locationCity: 'Florianópolis',
          locationCountry: 'Brasil',
          gpsLat: -27.5954,
          gpsLon: -48.5480,
          precision: 15,
          referencePoint: 'Praia Mole',
          status: 'awake',
          mutations: 10,
          superpowerName: 'Manipulação de Plasma',
          superpowerDescription: 'Gera e controla plasma energético',
          superpowerType: 'energia',
          superpowerRarity: 'rare',
          superpowerRisk: 45
        },
        {
          droneSerial: 'DR-2024-016',
          droneBrand: 'Parrot',
          droneManufacturer: 'Parrot SA',
          droneCountry: 'França',
          height: 78,
          weight: 2200,
          locationCity: 'João Pessoa',
          locationCountry: 'Brasil',
          gpsLat: -7.1153,
          gpsLon: -34.8611,
          precision: 12,
          referencePoint: 'Pontão do Jacaré',
          status: 'trance',
          heartRate: 42,
          mutations: 16,
          superpowerName: 'Reflexos Ultrarrápidos',
          superpowerDescription: 'Reage em velocidades sobre-humanas',
          superpowerType: 'mobilidade',
          superpowerRarity: 'epic',
          superpowerRisk: 72
        },
        {
          droneSerial: 'DR-2024-017',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 112,
          weight: 3400,
          locationCity: 'Aracaju',
          locationCountry: 'Brasil',
          gpsLat: -10.9092,
          gpsLon: -37.0677,
          precision: 18,
          referencePoint: 'Orla de Atalaia',
          status: 'awake',
          mutations: 8,
          superpowerName: 'Criação de Barreiras',
          superpowerDescription: 'Gera campos de força protetores',
          superpowerType: 'defensivo',
          superpowerRarity: 'uncommon',
          superpowerRisk: 30
        },
        {
          droneSerial: 'DR-2024-018',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 130,
          weight: 3900,
          locationCity: 'Maceió',
          locationCountry: 'Brasil',
          gpsLat: -9.5713,
          gpsLon: -36.7820,
          precision: 19,
          referencePoint: 'Praia de Pajuçara',
          status: 'trance',
          heartRate: 47,
          mutations: 17,
          superpowerName: 'Aniquilação Molecular',
          superpowerDescription: 'Desintegra matéria ao nível atômico',
          superpowerType: 'bélico',
          superpowerRarity: 'legendary',
          superpowerRisk: 88
        },
        {
          droneSerial: 'DR-2024-019',
          droneBrand: 'Parrot',
          droneManufacturer: 'Parrot SA',
          droneCountry: 'França',
          height: 93,
          weight: 2750,
          locationCity: 'Santos',
          locationCountry: 'Brasil',
          gpsLat: -23.9608,
          gpsLon: -46.3248,
          precision: 16,
          referencePoint: 'Aquário Municipal',
          status: 'awake',
          mutations: 6,
          superpowerName: 'Biorregeneração',
          superpowerDescription: 'Regenera tecidos danificados rapidamente',
          superpowerType: 'suporte',
          superpowerRarity: 'uncommon',
          superpowerRisk: 35
        },
        {
          droneSerial: 'DR-2024-020',
          droneBrand: 'Autel',
          droneManufacturer: 'Autel Robotics',
          droneCountry: 'USA',
          height: 107,
          weight: 3050,
          locationCity: 'Blumenau',
          locationCountry: 'Brasil',
          gpsLat: -26.9194,
          gpsLon: -49.0661,
          precision: 17,
          referencePoint: 'Catedral São Paulo',
          status: 'deep-hibernation',
          heartRate: 6,
          mutations: 2,
          superpowerName: null,
          superpowerDescription: null,
          superpowerType: null,
          superpowerRarity: null,
          superpowerRisk: null
        },
        {
          droneSerial: 'DR-2024-021',
          droneBrand: 'DJI',
          droneManufacturer: 'DJI Technology Co. Ltd.',
          droneCountry: 'China',
          height: 102,
          weight: 2900,
          locationCity: 'Campos do Jordão',
          locationCountry: 'Brasil',
          gpsLat: -22.7397,
          gpsLon: -45.5913,
          precision: 13,
          referencePoint: 'Praça São Benedito',
          status: 'awake',
          mutations: 12,
          superpowerName: 'Control de Calor',
          superpowerDescription: 'Absorve e libera energia térmica',
          superpowerType: 'elemental',
          superpowerRarity: 'rare',
          superpowerRisk: 52
        }
      ]
      
      await Duck.bulkCreate(sampleDucks)
      console.log(`✅ Successfully seeded ${sampleDucks.length} ducks!`)
    } else {
      console.log(`✅ Database contains ${duckCount} ducks`)
    }
  } catch (error) {
    console.error('⚠️  Error auto-seeding ducks:', error.message)
  }
}

// Test database connection and sync models
async function startServer() {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection has been established successfully.')
    
    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ alter: true })
    console.log('✅ Database synced successfully.')
    
    // Auto-seed ducks if empty
    await autoSeedDucks()
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
  }
}

startServer()

export default app


