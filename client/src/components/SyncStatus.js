import React from 'react';

const SyncStatus = ({ isOnline, lastSync, isSyncing }) => {
    return (
        <div className={`sync-status ${isSyncing ? 'syncing' : (isOnline ? 'online' : 'offline')}`}>
            {isOnline ? (
                <span>En línea {lastSync && `(Última sincronización: ${lastSync.toLocaleTimeString()})`
                }{isSyncing && ' (Sincronizando...)'}</span>
                
            ) : (
                <span>Modo offline - Los cambios se sincronizarán cuando recuperes la conexión</span>
            )}
        </div>
    );
};

export default SyncStatus;