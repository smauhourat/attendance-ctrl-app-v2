import { getPendingAttendances, clearPendingAttendances } from './db';
import { syncAttendances } from './api';

export const syncPendingAttendances = async () => {
    try {
        const pending = await getPendingAttendances();
        if (pending.length > 0) {
            const success = await syncAttendances(pending);
            if (success) {
                await clearPendingAttendances();
                return { success: true, count: pending.length };
            }
        }
        return { success: false, count: 0 };
    } catch (error) {
        console.error('Sync failed:', error);
        return { success: false, error };
    }
};

export const checkAndSync = async () => {
    console.log('checkAndSync........')
    await new Promise(resolve => setTimeout(resolve, 5000));
    const pending = await getPendingAttendances();
    if (pending.length > 0) {
        return await syncPendingAttendances();
    }
    return { success: true, count: 0 };
};