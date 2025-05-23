import { useState, useEffect } from 'react';
import { healthCheck } from '../services/api'; // Adjust the import path as necessary

export const useNetworkStatus = (interval = 10000) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isApiOnline, setIsApiOnline] = useState(true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        let timer;
        const checkApi = async () => {
            if (!isOnline) {
                setIsApiOnline(false);
                return;
            }
            try {
                // const res = await fetch(apiUrl, { method: 'HEAD' });
                const { status } = await healthCheck();
                console.log(`llamo a healthCheck() en useNetworkStatus.js: ${status}`);
                setIsApiOnline(status === 'ok');
            } catch {
                setIsApiOnline(false);
                //setIsOnline(false)
                console.log('API is offline');
            }
        };
        checkApi();
        timer = setInterval(checkApi, interval);
        return () => clearInterval(timer);
    }, [isOnline, interval]);

    return { isOnline, isApiOnline };
};

// import { useState, useEffect } from 'react';

// export const useNetworkStatus = () => {
//     const [isOnline, setIsOnline] = useState(navigator.onLine);

//     useEffect(() => {
//         const handleOnline = () => setIsOnline(true);
//         const handleOffline = () => setIsOnline(false);

//         window.addEventListener('online', handleOnline);
//         window.addEventListener('offline', handleOffline);

//         return () => {
//             window.removeEventListener('online', handleOnline);
//             window.removeEventListener('offline', handleOffline);
//         };
//     }, []);

//     return isOnline;
// };