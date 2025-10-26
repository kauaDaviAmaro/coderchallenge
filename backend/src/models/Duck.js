import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Duck = sequelize.define('Duck', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Drone Information
  droneSerial: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'drone_serial'
  },
  droneBrand: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'drone_brand'
  },
  droneManufacturer: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'drone_manufacturer'
  },
  droneCountry: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'drone_country'
  },
  // Physical Measurements
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Height in centimeters'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Weight in grams'
  },
  // Location Information
  locationCity: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'location_city'
  },
  locationCountry: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'location_country'
  },
  gpsLat: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'gps_lat'
  },
  gpsLon: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'gps_lon'
  },
  precision: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'GPS precision in centimeters'
  },
  referencePoint: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reference_point'
  },
  // Hibernation Status
  status: {
    type: DataTypes.ENUM('awake', 'trance', 'deep-hibernation'),
    allowNull: false,
    defaultValue: 'awake'
  },
  heartRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'heart_rate',
    comment: 'Heart rate in bpm'
  },
  // Mutations
  mutations: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  // Superpower Information
  superpowerName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'superpower_name'
  },
  superpowerDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'superpower_description'
  },
  superpowerType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'superpower_type'
  },
  superpowerRarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary'),
    allowNull: true,
    field: 'superpower_rarity'
  },
  superpowerRisk: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'superpower_risk',
    validate: { min: 0, max: 100 }
  },
  // Capture Status
  isCaptured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_captured'
  },
  capturedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'captured_at'
  },
  // Timestamps
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'registered_at'
  }
}, {
  tableName: 'ducks',
  timestamps: true,
  underscored: true
})

export default Duck

