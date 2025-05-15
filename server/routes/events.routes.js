const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');

// Obtener todos los eventos
router.get('/', eventsController.getAllEvents);

// Obtener eventos abiertos
router.get('/open', eventsController.getOpenEvents);

// Obtener un evento específico
router.get('/:id', eventsController.getEvent);

// Crear un nuevo evento
router.post('/', eventsController.createEvent);

// Actualizar un evento
router.put('/:id', eventsController.updateEvent);

// Obtener asistentes de un evento
router.get('/:eventId/attendees', eventsController.getEventAttendees);

module.exports = router;