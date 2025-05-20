
// const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = '/api'; // Usa proxy en desarrollo
// const API_URL = process.env.NODE_ENV === 'production'
//     ? '/api'
//     : process.env.REACT_APP_API_URL;

const API_URL = 'http://localhost:5000/api'

export const healthCheck = async () => {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
        throw new Error('Error checking API health');
    }
    return response.json();
}

export const fetchEvents = async () => {
    console.log(`llamo a fetchEvents(): ${API_URL}`)
    const response = await fetch(`${API_URL}/events/open`);
    if (!response.ok) {
        throw new Error('Error fetching events');
    }
    return response.json();
};

export const getEventAttendees = async (eventId) => {
    const response = await fetch(`${API_URL}/events/${eventId}/attendees`);
    if (!response.ok) {
        throw new Error('Error fetching attendees');
    }
    return response.json();
};

export const markAttendance = async (attendance) => {
    const response = await fetch(`${API_URL}/attendances`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            eventId: attendance.eventId,
            personId: attendance.personId
        }),
    });

    if (!response.ok) {
        throw new Error('Error marking attendance');
    }

    return response.json();
};

export const syncAttendances = async (pendingAttendances) => {
    const response = await fetch(`${API_URL}/attendances/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pendingAttendances
        }),
    });

    if (!response.ok) {
        throw new Error('Error syncing attendances');
    }

    return response.json();
};

