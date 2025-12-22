/**
 * Models Index
 * Central export for all models
 */
const User = require('./User');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');

module.exports = {
  User,
  Appointment,
  MedicalRecord
};

