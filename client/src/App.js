import React, { useState, useEffect } from 'react';
import EventList from './components/EventList';
import AttendanceList from './components/AttendanceList';
import SyncStatus from './components/SyncStatus';
import { getOpenEvents, saveEvent, saveEventsFromMongo } from './services/db';
import { fetchEvents } from './services/api';
import { checkAndSync } from './services/sync';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import './styles/App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const isOnline = useNetworkStatus();
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);


  // Sync periodically when online
  useEffect(() => {
    let interval;

    if (isOnline) {
      interval = setInterval(() => {
        setIsSyncing(true);
        checkAndSync();
        setLastSync(new Date());
        setIsSyncing(false);
      }, 1 * 60 * 1000); // Sync every 1 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isOnline) {
          setIsSyncing(true);
          // Sync pending data first
          const syncResult = await checkAndSync();
          if (syncResult.success && syncResult.count > 0) {
            console.log(`Sincronizados ${syncResult.count} registros`);
          }

          // Fetch fresh data
          // console.log('llama a fetchEvents')
          const serverEvents = await fetchEvents();
          // console.log('serverEvents =>', serverEvents)
          setEvents(serverEvents);

          // Save to local DB
          //await Promise.all(serverEvents.map(event => saveEvent(event)));
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
      }
    };
    console.log(`Cargo Eventos porque cambio isOnline ${isOnline}`)

    loadData();
  }, [isOnline]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Control de Asistencia</h1>
        <SyncStatus isOnline={isOnline} lastSync={lastSync} />
      </header>

      <main>
        {isSyncing && <div className="syncing-notice">Sincronizando datos...</div>}

        {selectedEvent ? (
          <AttendanceList
            event={selectedEvent}
            onBack={handleBackToList}
            isOnline={isOnline}
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