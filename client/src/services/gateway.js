import { fetchEvents as fetchEventsAPI } from './api';
import { getOpenEvents as fetchEventsDB } from './db';

// Recupera los eventos, intenta traerlos llamando a la api y si no tiene exito llama a la base local
export const getEvents = async () => {
    try {
        const eventsData = await fetchEventsAPI()
        console.info('Events from API =>', eventsData);
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