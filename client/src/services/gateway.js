import { fetchEvents as fetchEventsAPI, markAttendance as markAttendanceAPI } from './api';
import { getOpenEvents as fetchEventsDB, saveAttendance as saveAttendanceDB, saveEventsFromMongo, updateEventAttendeeStatus } from './db';

// Recupera los eventos, intenta traerlos llamando a la api y si no tiene exito llama a la base local
export const getEvents = async () => {
    try {
        const eventsData = await fetchEventsAPI()
        console.info('Events from API =>', eventsData);
        await saveEventsFromMongo(eventsData)
        return eventsData
    } catch (apiError) {
        console.warn('Error fetching events from API:', apiError);

        try {
            const localEvents = await fetchEventsDB();
            console.info('Events from DB =>', localEvents);
            return localEvents;
        } catch (dbError) {
            console.error('Error fetching events from DB:', dbError);
            return [];
        }
    }
}

export const markAttendance = async (attendance) => {
    try {
        console.log('Marking attendance:', attendance)
        const response = await markAttendanceAPI(attendance);

        if (!response.ok) {
            throw new Error('Error marking attendance on server');
        }

        // Si la API funciona, también actualizar localmente para consistencia
        await saveAttendanceDB(attendance);
        await updateEventAttendeeStatus(attendance.eventId, attendance.personId, true, attendance.timestamp);

        return response.json();
    } catch (apiError) {
        console.warn('Error marking attendance to API:', apiError);
        console.log('Falling back to local storage...');

        try {
            // Guardar en base local
            await saveAttendanceDB(attendance);

            // Actualizar el estado del asistente en el evento local
            await updateEventAttendeeStatus(attendance.eventId, attendance.personId, true, attendance.timestamp);

            return { success: true, offline: true };
        } catch (dbError) {
            console.error('Error marking attendance to DB:', dbError);
            throw dbError;
        }
    }
}