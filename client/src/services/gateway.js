import { fetchEvents as fetchEventsAPI, markAttendance as markAttendanceAPI } from './api';
import { getOpenEvents as fetchEventsDB, saveAttendance as saveAttendanceDB, saveEventsFromMongo } from './db';

// Recupera los eventos, intenta traerlos llamando a la api y si no tiene exito llama a la base local
export const getEvents = async () => {
    try {
        const eventsData = await fetchEventsAPI()
        console.info('Events from API =>', eventsData);
        await saveEventsFromMongo(eventsData)
        return eventsData
    } catch(apiError) {
        console.warn('Error fetching events from API:', apiError);
        // console.warn('API no disponible, usando datos locales:', apiError);
        try {
            const localEvents = await fetchEventsDB();
            console.info('Events from DB =>', localEvents);
            return localEvents;
        } catch(dbError) {
            console.error('Error fetching events from DB:', dbError);
        }
    }
}

export const markAttendance = async (attendance) => {
    try {
        console.log('attendance', attendance)
        const response = await markAttendanceAPI(attendance);
        
        if (!response.ok) {
            throw new Error('Error marking attendance 2');
        }

        return response.json();
    } catch (apiError) {
        console.warn('Error marking attendance to API:', apiError);
        try {
            await saveAttendanceDB(attendance);
            return { success: true };
        } catch(dbError) {
            console.error('Error marking attendance to DB:', dbError);
        }        
    }
}