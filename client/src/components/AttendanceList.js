import React, { useState, useEffect } from 'react';
import PersonCard from './PersonCard';
import SearchBar from './SearchBar';
import { markAttendance as markAttendanceApi, getEventAttendees as getEventWithAttendeesAPI } from '../services/api';
import { saveAttendance, getLocalEventWithAttendees } from '../services/db';

const AttendanceList = ({ event, onBack, isOnline, refresh }) => {
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect (() => {
        console.log(`event in AttendanceList (online: ${isOnline}) =>`, event)
    }, [event])

    useEffect(() => {
        console.log('Se disparo refreshAttendance()')
    }, [refresh])


    useEffect(() => {
        
        const loadAttendees = async () => {
            setIsLoading(true);
            try {
                let eventData;

                if (isOnline) {
                    console.log('llamo getEventWithAttendeesAPI()')
                    eventData = await getEventWithAttendeesAPI(event.id);
                    event = eventData.event;
                } else {
                    console.log('llamo a getLocalEventWithAttendees()')
                    eventData = await getLocalEventWithAttendees(event.id);
                    console.log('eventData =>', eventData)
                }

                setAttendees(eventData?.attendees || []);
            } catch (error) {
                console.error('Error loading attendees:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAttendees();
    }, [event.id, isOnline, refresh]);

    useEffect(() => {
        const filtered = attendees.filter(person =>
            person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.credentialNumber.includes(searchTerm) ||
            person.dni.includes(searchTerm) ||
            person.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAttendees(filtered);
    }, [searchTerm, attendees]);

    const handleMarkAttendance = async (personId) => {
        const attendanceRecord = {
            eventId: event.id,
            personId,
            timestamp: new Date().toISOString()
        };

        try {
            if (isOnline) {
                await markAttendanceApi(attendanceRecord);
            } else {                
                await saveAttendance(attendanceRecord);
            }

            setAttendees(attendees.map(person =>
                person.id === personId
                    ? {
                        ...person,
                        attended: true,
                        attendanceTime: attendanceRecord.timestamp
                    }
                    : person
            ));

            console.log('attendees =>', attendees)
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    if (isLoading) {
        return <div className="loading">Cargando asistentes...</div>;
    }

    return (
        <div className="attendance-list">
            <button className="back-button" onClick={onBack}>
                &larr; Volver a Eventos
            </button>
            <h1>Registro de Asistencia</h1>
            <h2>{event.name}</h2>

            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            <div className="stats">
                <p>
                    Total: {attendees.length} |
                    Asistentes: {attendees.filter(a => a.attended).length}
                </p>
            </div>

            <div className="person-list">
                {filteredAttendees.length > 0 ? (
                    filteredAttendees.map(person => (
                        <PersonCard
                            key={person._id}
                            person={person}
                            onMarkAttendance={handleMarkAttendance}
                        />
                    ))
                ) : (
                    <p className="no-results">No se encontraron resultados</p>
                )}
            </div>
        </div>
    );
};

export default AttendanceList;