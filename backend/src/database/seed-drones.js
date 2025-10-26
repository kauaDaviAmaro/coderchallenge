import Drone from '../models/Drone.js'
import sequelize from '../config/database.js'

const sampleDrones = [
  {
    serial: 'DR-2024-001',
    brand: 'DJI',
    manufacturer: 'DJI Technology Co. Ltd.',
    country: 'China',
    model: 'Phantom 4 Pro',
    status: 'active',
    notes: 'High-performance aerial photography drone with 4K camera'
  },
  {
    serial: 'DR-2024-002',
    brand: 'DJI',
    manufacturer: 'DJI Technology Co. Ltd.',
    country: 'China',
    model: 'Mavic 3',
    status: 'active',
    notes: 'Foldable pro drone with Hasselblad camera'
  },
  {
    serial: 'DR-2024-003',
    brand: 'Autel',
    manufacturer: 'Autel Robotics',
    country: 'USA',
    model: 'EVO II Pro',
    status: 'active',
    notes: 'Enterprise-grade drone with 6K camera'
  },
  {
    serial: 'DR-2024-004',
    brand: 'Autel',
    manufacturer: 'Autel Robotics',
    country: 'USA',
    model: 'EVO Nano+',
    status: 'inactive',
    notes: 'Lightweight consumer drone'
  },
  {
    serial: 'DR-2024-005',
    brand: 'Parrot',
    manufacturer: 'Parrot SA',
    country: 'França',
    model: 'Anafi AI',
    status: 'active',
    notes: 'AI-powered inspection drone'
  },
  {
    serial: 'DR-2024-006',
    brand: 'Parrot',
    manufacturer: 'Parrot SA',
    country: 'França',
    model: 'Anafi',
    status: 'maintenance',
    notes: '4K HDR camera drone'
  },
  {
    serial: 'DR-2024-007',
    brand: 'Skydio',
    manufacturer: 'Skydio Inc.',
    country: 'USA',
    model: 'X2',
    status: 'active',
    notes: 'Autonomous enterprise drone with obstacle avoidance'
  },
  {
    serial: 'DR-2024-008',
    brand: 'DJI',
    manufacturer: 'DJI Technology Co. Ltd.',
    country: 'China',
    model: 'Mini 3 Pro',
    status: 'active',
    notes: 'Ultra-lightweight pro drone under 250g'
  },
  {
    serial: 'DR-2024-009',
    brand: 'Autel',
    manufacturer: 'Autel Robotics',
    country: 'USA',
    model: 'EVO Lite+',
    status: 'active',
    notes: 'Entry-level prosumer drone with 4K camera'
  },
  {
    serial: 'DR-2024-010',
    brand: 'DJI',
    manufacturer: 'DJI Technology Co. Ltd.',
    country: 'China',
    model: 'Air 2S',
    status: 'active',
    notes: 'Compact 5.4K video recording drone'
  }
]

async function seedDrones() {
  try {
    // Connect to database
    await sequelize.authenticate()
    console.log('✅ Connected to database')
    
    // Sync database
    await sequelize.sync({ alter: true })
    console.log('✅ Database synced')
    
    // Check if drones already exist
    const existingDrones = await Drone.count()
    
    if (existingDrones > 0) {
      console.log(`⚠️  Database already has ${existingDrones} drones`)
      console.log('   Skipping seed. If you want to reseed, delete drones first.')
      return
    }
    
    // Insert sample drones
    for (const droneData of sampleDrones) {
      await Drone.create(droneData)
    }
    
    console.log(`✅ Successfully seeded ${sampleDrones.length} drones!`)
    console.log('\n📊 Sample drones created:')
    sampleDrones.forEach((drone, index) => {
      console.log(`   ${index + 1}. ${drone.serial} - ${drone.brand} ${drone.model} (${drone.status})`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await sequelize.close()
    process.exit(0)
  }
}

seedDrones()
