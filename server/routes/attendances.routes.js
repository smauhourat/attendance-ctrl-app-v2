const express = require('express');
const router = express.Router();
const attendancesController = require('../controllers/attendances.controller');

// Registrar asistencia
router.post('/', attendancesController.markAttendance);

// Sincronizar asistencias desde cliente offline
router.post('/sync', attendancesController.syncAttendances);

// Obtener estadísticas de evento
router.get('/stats/:eventId', attendancesController.getEventStats);

module.exports = router;