// src/hooks/useConnectivity.ts
import { useEffect } from 'react';
import { syncNotes, startSyncService } from '../services/syncService';
import { ActionTypes, useNotes } from '../context';

export const useConnection = () => {
    const { state, dispatch } = useNotes();

    useEffect(() => {
        const handleOnline = async () => {
            dispatch({ type: ActionTypes.SET_ONLINE, payload: true });
            dispatch({ type: ActionTypes.SET_SYNCING, payload: true });

            try {
                const result = await syncNotes();
                if (result) {
                    dispatch({ type: ActionTypes.SET_SYNCING, payload: false });
                }

                state.notes.forEach((note) => {
                    if (!note.synced) {
                        dispatch({ type: ActionTypes.UPDATE_NOTE, payload: { ...note, synced: true } });
                    }
                });

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
            dispatch({ type: ActionTypes.SET_ONLINE, payload: false });
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