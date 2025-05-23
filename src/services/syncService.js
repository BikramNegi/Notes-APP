// src/services/syncService.ts
import db from '../db';
import axios from 'axios';

const API_URL = 'http://localhost:3001/notes';
const SYNC_INTERVAL = 3000;

let syncInterval = null;


const syncUnsyncedNotes = async (unsyncedNotes) => {
    for (const note of unsyncedNotes) {
        const getUrl = `${API_URL}/${note.id}`;
        let result = null;
        try {
            result = await axios.get(getUrl);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                await axios.post(API_URL, note);
            }
        }
        if (result) {
            await axios.put(`${API_URL}/${note.id}`, note);
        }
        await db.notes.update(note.id, { synced: true });
    }
};

const syncDeletedNotes = async (deletedNotes) => {

    for (const note of deletedNotes) {
        const id = note.id;
        console.log("sync deleted notes", id);
        const Url = `${API_URL}/${id}`
        console.log("sync deleted notes", Url);
        let result = null;
        try {
            result = await axios.get(Url);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                console.log("notes with id not found");
            }
        }

        if (result) {
            await axios.delete(`${API_URL}/${id}`);
        }
        await db.deletedNotes.delete(id);
    }
};

const mergeServerNotes = async (serverNotes) => {
    for (const serverNote of serverNotes) {
        const localNote = await db.notes.get(serverNote.id);
        if (!localNote || new Date(serverNote.updatedAt) > new Date(localNote.updatedAt)) {
            await db.notes.put({ ...serverNote, synced: true });
        }
    }
};

const removeLocallyDeletedNotes = async (serverNotes) => {
    const localNotes = await db.notes.toArray();
    const serverNoteIds = serverNotes.map(note => note.id);
    for (const localNote of localNotes) {
        if (!serverNoteIds.includes(localNote.id) && localNote.synced) {
            await db.notes.delete(localNote.id);
        }
    }
};

export const syncNotes = async () => {
    console.log('Syncing notes...');
    try {
        const unsyncedNotes = await db.notes
            .filter(note => !note.synced)
            .toArray();

        const deletedNotes = await db.deletedNotes.toArray();

        if (unsyncedNotes.length === 0 && deletedNotes.length === 0) {
            console.log('No changes to sync');
            return true;
        }

        await syncUnsyncedNotes(unsyncedNotes);
        await syncDeletedNotes(deletedNotes);

        const { data: serverNotes } = await axios.get(API_URL);

        await mergeServerNotes(serverNotes);
        await removeLocallyDeletedNotes(serverNotes);

        return true;
    } catch (error) {
        console.error('Sync failed:', error);
        return false;
    }
};

export const startSyncService = () => {
    if (syncInterval) clearInterval(syncInterval);

    syncNotes();

    syncInterval = setInterval(syncNotes, SYNC_INTERVAL);

    return () => {
        if (syncInterval) clearInterval(syncInterval);
    };
};