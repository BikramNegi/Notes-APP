import Dexie from 'dexie';

const db = new Dexie('notesDB');
db.version(1).stores({
    notes: 'id, title, content, updatedAt, synced',
    deletedNotes: 'id',
});

export default db;