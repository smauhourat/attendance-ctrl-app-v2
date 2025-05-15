import React from 'react';

const EventCard = ({ event, onClick }) => {
    const totalAttendees = event.attendees?.length || 0;
    const attendedCount = event.attendees?.filter(a => a.attended)?.length || 0;

    return (
        <div className="event-card" onClick={onClick}>
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <div className="event-details">
                <span>Fecha: {new Date(event.date).toLocaleDateString()}</span>
                <span>Estado: {event.status === 'open' ? 'Abierto' : 'Cerrado'}</span>
            </div>
            <div className="attendance-stats">
                <span>Asistentes: {attendedCount}/{totalAttendees}</span>
            </div>
        </div>
    );
};

export default EventCard;