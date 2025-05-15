const Attendance = require('../models/Attendance.model');
const Event = require('../models/Event.model');
const Person = require('../models/Person.model');

// Registrar asistencia
exports.markAttendance = async (req, res) => {
    const { eventId, personId } = req.body;

    try {
        // Verificar que el evento existe y está abierto
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        if (event.status !== 'open') {
            return res.status(400).json({ message: 'El evento no está abierto para registrar asistencias' });
        }

        // Verificar que la persona está asignada al evento
        const isAttendee = event.attendees.some(attendee =>
            attendee.toString() === personId
        );

        if (!isAttendee) {
            return res.status(400).json({ message: 'La persona no está asignada a este evento' });
        }

        // Registrar la asistencia
        const attendance = new Attendance({
            event: eventId,
            person: personId
        });

        const savedAttendance = await attendance.save();

        res.status(201).json({
            message: 'Asistencia registrada correctamente',
            attendance: savedAttendance
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'La asistencia ya estaba registrada' });
        }
        res.status(500).json({ message: err.message });
    }
};

// Sincronizar asistencias desde el cliente offline
exports.syncAttendances = async (req, res) => {
    const { pendingAttendances } = req.body;

    if (!Array.isArray(pendingAttendances)) {
        return res.status(400).json({ message: 'Se esperaba un array de asistencias' });
    }

    try {
        const results = [];

        for (const att of pendingAttendances) {
            try {
                // Verificar que no exista ya esta asistencia
                const exists = await Attendance.findOne({
                    event: att.eventId,
                    person: att.personId
                });

                if (exists) {
                    results.push({
                        eventId: att.eventId,
                        personId: att.personId,
                        status: 'skipped',
                        message: 'Asistencia ya registrada'
                    });
                    continue;
                }

                // Registrar la nueva asistencia
                const newAttendance = new Attendance({
                    event: att.eventId,
                    person: att.personId,
                    timestamp: att.timestamp,
                    synced: true
                });

                await newAttendance.save();

                results.push({
                    eventId: att.eventId,
                    personId: att.personId,
                    status: 'success',
                    message: 'Asistencia sincronizada'
                });
            } catch (err) {
                results.push({
                    eventId: att.eventId,
                    personId: att.personId,
                    status: 'error',
                    message: err.message
                });
            }
        }

        res.json({
            message: 'Proceso de sincronización completado',
            results
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Obtener estadísticas de un evento
exports.getEventStats = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        const totalAttendees = event.attendees.length;
        const attendedCount = await Attendance.countDocuments({
            event: req.params.eventId
        });

        res.json({
            totalAttendees,
            attendedCount,
            pendingCount: totalAttendees - attendedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};