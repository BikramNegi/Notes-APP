// src/hooks/useConnectivity.ts
import { useEffect } from 'react';
import { syncNotes, startSyncService } from '../services/syncService';
import { ActionTypes, useNotes } from '../context';

export const useConnection = () => {
    const { dispatch } = useNotes();

    useEffect(() => {
        const handleOnline = async () => {
            dispatch({ type: ActionTypes.SET_ONLINE, payload: true });
            dispatch({ type: ActionTypes.SET_SYNCING, payload: true });

            try {
                await syncNotes();

                const cleanup = startSyncService();

                return () => {
                    cleanup();
                    dispatch({ type: ActionTypes.SET_SYNCING, payload: false });
                };
            } catch (error) {
                console.error('Online handler error:', error);
                dispatch({ type: ActionTypes.SET_SYNCING, payload: false });
            }
        };

        const handleOffline = () => {
            dispatch({ type: ActionTypes.SET_SYNCING, payload: false });
            dispatch({ type: ActionTypes.SET_SYNCING, payload: false });
        };

        if (navigator.onLine) {
            handleOnline();
        } else {
            dispatch({ type: ActionTypes.SET_ONLINE, payload: false });
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [dispatch]);

    const { state: { online, syncing } } = useNotes();
    return { online, syncing };
};