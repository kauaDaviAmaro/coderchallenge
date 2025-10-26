import express from 'express'
import Drone from '../models/Drone.js'

const router = express.Router()

// GET /api/drones - Get all drones
router.get('/', async (req, res) => {
  try {
    const drones = await Drone.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.json(drones)
  } catch (error) {
    console.error('Error fetching drones:', error)
    res.status(500).json({ error: 'Failed to fetch drones' })
  }
})

// GET /api/drones/:id - Get a single drone
router.get('/:id', async (req, res) => {
  try {
    const drone = await Drone.findByPk(req.params.id)
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' })
    }
    res.json(drone)
  } catch (error) {
    console.error('Error fetching drone:', error)
    res.status(500).json({ error: 'Failed to fetch drone' })
  }
})

// POST /api/drones - Create a new drone
router.post('/', async (req, res) => {
  try {
    const drone = await Drone.create(req.body)
    res.status(201).json(drone)
  } catch (error) {
    console.error('Error creating drone:', error)
    res.status(500).json({ error: 'Failed to create drone', details: error.message })
  }
})

// PUT /api/drones/:id - Update a drone
router.put('/:id', async (req, res) => {
  try {
    const drone = await Drone.findByPk(req.params.id)
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' })
    }
    
    await drone.update(req.body)
    await drone.reload()
    
    res.json(drone)
  } catch (error) {
    console.error('Error updating drone:', error)
    res.status(500).json({ error: 'Failed to update drone', details: error.message })
  }
})

// DELETE /api/drones/:id - Delete a drone
router.delete('/:id', async (req, res) => {
  try {
    const drone = await Drone.findByPk(req.params.id)
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' })
    }
    
    await drone.destroy()
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting drone:', error)
    res.status(500).json({ error: 'Failed to delete drone' })
  }
})

export default router

