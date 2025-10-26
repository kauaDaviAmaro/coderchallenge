import Duck from './Duck.js'
import Drone from './Drone.js'
import sequelize from '../config/database.js'

// Initialize associations if needed
const models = {
  Duck,
  Drone,
  sequelize
}

export default models


