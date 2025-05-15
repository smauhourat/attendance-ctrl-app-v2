import React from 'react';
import EventCard from './EventCard';

const EventList = ({ events, onEventSelect }) => {
    // console.log('events =>', events)
    return (
        <div className="event-list">
            <h1>Eventos Disponibles</h1>
            <div className="events-container">
                {events.map(event => (
                    <EventCard
                        key={event._id}
                        event={event}
                        onClick={() => onEventSelect(event)}
                    />
                ))}
            </div>
        </div>
    );
};

export default EventList;