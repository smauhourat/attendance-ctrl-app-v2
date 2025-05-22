import React, { useState, useEffect, useCallback } from 'react';
import EventList from './components/EventList';
import AttendanceList from './components/AttendanceList';
import SyncStatus from './components/SyncStatus';
import { getEvents } from './services/gateway';
import { checkAndSync } from './services/sync';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import './styles/App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { isOnline } = useNetworkStatus();

  // Función principal para actualizar eventos
  const refreshEvents = useCallback(async () => {
    try {
      setIsSyncing(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Función para sincronizar datos pendientes
  const syncData = useCallback(async () => {
    try {
      const syncResult = await checkAndSync();
      if (syncResult.success && syncResult.count > 0) {
        console.log(`Sincronizados ${syncResult.count} registros`);
      }
      setLastSync(new Date());
      return syncResult;
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: false, count: 0 };
    }
  }, []);

  // Función completa de carga: sync + refresh
  const loadAndSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Primero sincronizamos datos pendientes
      await syncData();
      // Luego cargamos eventos actualizados
      await refreshEvents();
      // Disparamos refresh para componentes hijos
      setRefreshTrigger(prev => prev + 1);
    } finally {
      setIsSyncing(false);
    }
  }, [syncData, refreshEvents]);

  // Cargar datos inicial y cuando cambia el estado de red
  useEffect(() => {
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    loadAndSync();
  }, [isOnline, loadAndSync]);

  // Sincronización periódica cuando está online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      console.log('Periodic sync triggered');
      loadAndSync();
    }, 60 * 1000); // Cada 1 minuto

    return () => clearInterval(interval);
  }, [isOnline, loadAndSync]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    refreshEvents();
  };

  const handleAttendanceChange = () => {
    // Disparar refresh para sincronizar datos después de marcar asistencia
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <header>
        <h1>Control de Asistencia</h1>
        <SyncStatus isOnline={isOnline} lastSync={lastSync} />
        {isSyncing && (
          <div className="syncing-notice">Sincronizando datos...</div>
        )}
      </header>

      <main>
        {selectedEvent ? (
          <AttendanceList
            event={selectedEvent}
            onBack={handleBackToList}
            isOnline={isOnline}
            refreshTrigger={refreshTrigger}
            onAttendanceChange={handleAttendanceChange}
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