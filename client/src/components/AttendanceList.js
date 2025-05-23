import React, { useState, useEffect, useMemo } from 'react';
import PersonCard from './PersonCard';
import SearchBar from './SearchBar';
import { getEventAttendees as getEventWithAttendeesAPI } from '../services/api';
import { getLocalEventWithAttendees } from '../services/db';
import { markAttendance } from '../services/gateway';

const AttendanceList = ({ event, onBack, isOnline, isApiOnline, refreshTrigger, onAttendanceChange }) => {
    const [attendees, setAttendees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para cargar asistentes
    const loadAttendees = async () => {
        setIsLoading(true);
        setError(null);

        try {
            let eventData;

            if (isOnline && isApiOnline) {
                console.log('Loading attendees from server...');
                eventData = await getEventWithAttendeesAPI(event.id);
            } else {
                console.log('Loading attendees from local DB...');
                eventData = await getLocalEventWithAttendees(event.id);
            }

            setAttendees(eventData?.attendees || []);
        } catch (error) {
            console.error('Error loading attendees:', error);
            setError('Error al cargar los asistentes. Por favor, intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar asistentes cuando cambie el evento, estado de red o refresh trigger
    useEffect(() => {
        if (event?.id) {
            loadAttendees();
        }
    }, [event.id, isOnline, isApiOnline, refreshTrigger]);

    // Filtrar asistentes basado en el término de búsqueda
    const filteredAttendees = useMemo(() => {
        if (!searchTerm.trim()) return attendees;

        const searchLower = searchTerm.toLowerCase();
        return attendees.filter(person =>
            person.name.toLowerCase().includes(searchLower) ||
            person.credentialNumber.includes(searchTerm) ||
            person.dni.includes(searchTerm) ||
            person.email.toLowerCase().includes(searchLower)
        );
    }, [searchTerm, attendees]);

    // Estadísticas de asistencia
    const attendanceStats = useMemo(() => {
        const total = attendees.length;
        const attended = attendees.filter(a => a.attended).length;
        return { total, attended };
    }, [attendees]);

    const handleMarkAttendance = async (personId) => {
        const attendanceRecord = {
            eventId: event.id,
            personId,
            timestamp: new Date().toISOString()
        };

        try {
            // Actualizar UI inmediatamente (optimistic update)
            setAttendees(prevAttendees =>
                prevAttendees.map(person =>
                    person.id === personId
                        ? {
                            ...person,
                            attended: true,
                            attendanceTime: attendanceRecord.timestamp
                        }
                        : person
                )
            );

            // Intentar marcar asistencia (maneja online/offline internamente)
            await markAttendance(attendanceRecord);

            // Notificar al componente padre que hubo un cambio en asistencia
            if (onAttendanceChange) {
                onAttendanceChange();
            }            

        } catch (error) {
            console.error('Error marking attendance:', error);

            // Revertir cambio optimista en caso de error
            setAttendees(prevAttendees =>
                prevAttendees.map(person =>
                    person.id === personId
                        ? {
                            ...person,
                            attended: false,
                            attendanceTime: null
                        }
                        : person
                )
            );

            setError('Error al marcar asistencia. Por favor, intenta nuevamente.');
        }
    };

    if (isLoading) {
        return (
            <div className="attendance-list">
                <button className="back-button" onClick={onBack}>
                    &larr; Volver a Eventos
                </button>
                <div className="loading">Cargando asistentes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="attendance-list">
                <button className="back-button" onClick={onBack}>
                    &larr; Volver a Eventos
                </button>
                <div className="error">
                    <p>{error}</p>
                    <button onClick={loadAttendees} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="attendance-list">
            <button className="back-button" onClick={onBack}>
                &larr; Volver a Eventos
            </button>

            <div className="header">
                <h1>Registro de Asistencia</h1>
                <h2>{event.name}</h2>
                {(!isOnline || !isApiOnline) && (
                    <div className="offline-notice">
                        Modo offline - Los cambios se sincronizarán cuando vuelvas a estar online
                    </div>
                )}
            </div>

            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, DNI, credencial o email..."
            />

            <div className="stats">
                <p>
                    Total: {attendanceStats.total} |
                    Asistentes: {attendanceStats.attended} |
                    Pendientes: {attendanceStats.total - attendanceStats.attended}
                </p>
            </div>

            <div className="person-list">
                {filteredAttendees.length > 0 ? (
                    filteredAttendees.map(person => (
                        <PersonCard
                            key={person._id || person.id}
                            person={person}
                            onMarkAttendance={handleMarkAttendance}
                        />
                    ))
                ) : (
                    <div className="no-results">
                        {searchTerm ?
                            `No se encontraron resultados para "${searchTerm}"` :
                            'No hay asistentes registrados para este evento'
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceList;