import React, { useState, useEffect, useCallback } from 'react';
import EventList from './components/EventList';
import AttendanceList from './components/AttendanceList';
import SyncStatus from './components/SyncStatus';
import { getOpenEvents, saveEvent, saveEventsFromMongo } from './services/db';
import { fetchEvents } from './services/api';
import { checkAndSync } from './services/sync';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import './styles/App.css';
import { getEvents } from './services/gateway';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOnline } = useNetworkStatus();
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshAttendance, setRefreshAttendance] = useState()


  const loadData2 = async () => {
    try {
      if (isOnline) {
        setIsSyncing(true);
        // Sync pending data first
        const syncResult = await checkAndSync();
        if (syncResult.success && syncResult.count > 0) {
          console.log(`Sincronizados ${syncResult.count} registros`);
        }

        // Fetch fresh data
        const serverEvents = await fetchEvents();
        setEvents(serverEvents);

        // Save to local DB
        await saveEventsFromMongo(serverEvents)

        setLastSync(new Date());
      } else {
        const localEvents = await getOpenEvents();
        setEvents(localEvents);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsSyncing(false);
      setRefreshAttendance(new Date())
    }
  };  

  // Sync periodically when online
  // useEffect(() => {
  //   let interval;

  //   if (isOnline) {
  //     interval = setInterval(() => {
  //       console.log('llamo a loadData2() en App.js')
  //       loadData2()
  //       // setRefreshAttendance(new Date())
  //       // setIsSyncing(true);
  //       // checkAndSync();
  //       // setLastSync(new Date());
  //       // setIsSyncing(false);
  //     }, 1 * 60 * 1000); // Sync every 1 minutes
  //   }

  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [isOnline]);

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       if (isOnline) {
  //         setIsSyncing(true);
  //         // Sync pending data first
  //         const syncResult = await checkAndSync();
  //         if (syncResult.success && syncResult.count > 0) {
  //           console.log(`Sincronizados ${syncResult.count} registros`);
  //         }

  //         // Fetch fresh data
  //         const serverEvents = await fetchEvents();
  //         setEvents(serverEvents);

  //         // Save to local DB
  //         await saveEventsFromMongo(serverEvents) 

  //         setLastSync(new Date());
  //       } else {
  //         const localEvents = await getOpenEvents();
  //         setEvents(localEvents);
  //       }
  //     } catch (error) {
  //       console.error('Error loading data:', error);
  //     } finally {
  //       setIsSyncing(false);
  //     }
  //   };
  //   // console.log(`Cargo Eventos porque cambio isOnline ${isOnline}`)

  //   loadData();
  // }, [isOnline]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  const refreshEvents = useCallback(async () => {
    const eventsData = await getEvents();
    setEvents(eventsData);
  }, []);

  const syncAttendances = useCallback(async () => {
    await checkAndSync();
    setLastSync(new Date());
  }, []);

  // Sync periodically when online
  useEffect(() => {
    let interval;

    if (isOnline) {
      interval = setInterval(() => {
        console.log('trigger interval check');
        setIsSyncing(true);
        syncAttendances();
        refreshEvents();
        setRefreshAttendance(new Date())
        setIsSyncing(false)
      }, 1 * 60 * 1000); // Sync every 1 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline]);

  useEffect(() => {
    console.log(`isOnline cambió a ${isOnline}`);
    refreshEvents();
  }, [isOnline, refreshEvents])

  return (
    <div className="app">
      <header>
        <h1>Control de Asistencia</h1>
        <SyncStatus isOnline={isOnline} lastSync={lastSync} />
        {isSyncing && <div className="syncing-notice">Sincronizando datos...</div>}
      </header>

      <main>

        {selectedEvent ? (
          <AttendanceList
            event={selectedEvent}
            onBack={handleBackToList}
            isOnline={isOnline}
            refresh={refreshAttendance}
          />
        ) : (
          <EventList
            events={events}
            onEventSelect={handleEventSelect}
          />
        )}
      </main>
    </div>
  );
}

export default App;