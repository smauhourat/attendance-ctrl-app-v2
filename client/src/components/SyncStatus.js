import React from 'react';

const SyncStatus = ({ isOnline, lastSync }) => {
    return (
        <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? (
                <span>En línea {lastSync && `(Última sincronización: ${lastSync.toLocaleTimeString()})`}</span>
            ) : (
                <span>Modo offline - Los cambios se sincronizarán cuando recuperes la conexión</span>
            )}
        </div>
    );
};

export default SyncStatus;