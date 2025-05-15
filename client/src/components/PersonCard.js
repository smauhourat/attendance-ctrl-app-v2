import React from 'react';

const PersonCard = ({ person, onMarkAttendance }) => {
    return (
        <div className={`person-card ${person.attended ? 'attended' : ''}`}>
            <div className="person-info">
                <h3>{person.name}</h3>
                <div className="person-details">
                    <p><strong>Credencial:</strong> {person.credentialNumber}</p>
                    <p><strong>DNI:</strong> {person.dni}</p>
                    <p><strong>Email:</strong> {person.email}</p>
                </div>
                {person.attended && (
                    <p className="attendance-time">
                        <strong>Asistió:</strong> {new Date(person.attendanceTime).toLocaleString()}
                    </p>
                )}
            </div>
            {!person.attended && (
                <button
                    onClick={() => onMarkAttendance(person.id)}
                    className="attendance-button"
                >
                    Registrar Asistencia
                </button>
            )}
        </div>
    );
};

export default PersonCard;