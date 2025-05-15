import { openDB } from 'idb';

const dbName = 'attendanceDB';
const storeNames = {
    EVENTS: 'events',
    ATTENDANCES: 'attendances',
    PENDING: 'pending_attendances'
};

export const initDB = async () => {
    return openDB(dbName, 2, {
        upgrade(db, oldVersion) {
            if (oldVersion < 1) {
                const eventStore = db.createObjectStore(storeNames.EVENTS, { keyPath: 'id' });
                eventStore.createIndex('byStatus', 'status');
            }
            if (oldVersion < 2) {
                const attendanceStore = db.createObjectStore(storeNames.ATTENDANCES, {
                    keyPath: ['eventId', 'personId']
                });
                attendanceStore.createIndex('byEvent', 'eventId');

                db.createObjectStore(storeNames.PENDING, {
                    keyPath: ['eventId', 'personId']
                });
            }
        },
    });
};

// Event operations
export const getEvents = async () => {
    const db = await initDB();
    return db.getAll(storeNames.EVENTS);
};

// export const saveEvent = async (event) => {
//     const db = await initDB();
//     return db.put(storeNames.EVENTS, event);
// };

// Función mejorada para guardar eventos desde MongoDB
export const saveEventsFromMongo = async (events) => {
    console.log('save event in localDB')
    const db = await initDB();
    const tx = db.transaction(storeNames.EVENTS, 'readwrite');
    const store = tx.objectStore(storeNames.EVENTS);

    // Convertir objetos MongoDB a formato compatible con IndexedDB
    const formattedEvents = events.map(event => ({
        id: event._id.toString(), // Convertir ObjectId a string
        name: event.name,
        description: event.description,
        date: event.date,
        status: event.status,
        attendees: event.attendees,//.map(attendee => attendee.toJSON()), // Convertir ObjectIds
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
    }));

    // Guardar todos los eventos
    await Promise.all(formattedEvents.map(event => store.put(event)));

    return tx.done;
};

export const getOpenEvents = async () => {
    const db = await initDB();
    console.log('llamo a getOpenEvents()')
    return db.getAllFromIndex(storeNames.EVENTS, 'byStatus', 'open');
};

// Attendance operations
export const saveAttendance = async (attendance) => {
    const db = await initDB();
    const tx = db.transaction(
        [storeNames.ATTENDANCES, storeNames.PENDING],
        'readwrite'
    );

    await tx.objectStore(storeNames.ATTENDANCES).put(attendance);
    await tx.objectStore(storeNames.PENDING).put(attendance);

    return tx.done;
};

// Función mejorada para guardar asistencias desde MongoDB
// export const saveAttendancesFromMongo = async (attendances) => {
//     const db = await initDB();
//     const tx = db.transaction(storeNames.ATTENDANCES, 'readwrite');
//     const store = tx.objectStore(storeNames.ATTENDANCES);

//     const formattedAttendances = attendances.map(att => ({
//         eventId: att.event.toString(),
//         personId: att.person.toString(),
//         timestamp: att.timestamp,
//         synced: true
//     }));

//     await Promise.all(formattedAttendances.map(att => store.put(att)));

//     return tx.done;
// };

export const getEventAttendances = async (eventId) => {
    const db = await initDB();
    return db.getAllFromIndex(
        storeNames.ATTENDANCES,
        'byEvent',
        IDBKeyRange.only(eventId)
    );
};

export const getPendingAttendances = async () => {
    const db = await initDB();
    return db.getAll(storeNames.PENDING);
};

export const clearPendingAttendances = async () => {
    const db = await initDB();
    return db.clear(storeNames.PENDING);
};

export const getLocalEventWithAttendees = async (eventId) => {
    const db = await initDB();
    const event = await db.get(storeNames.EVENTS, eventId);

    if (!event) return null;

    return event

    // const attendances = await getEventAttendances(eventId);
    // // aca ta el kilombo
    // return {
    //     ...event,
    //     attendees: event.attendees.map(attendee => {
    //         const attendance = attendances.find(a => a.personId === attendee.id);
    //         return {
    //             ...attendee,
    //             attended: !!attendance,
    //             attendanceTime: attendance?.timestamp
    //         };
    //     })
    // };
};