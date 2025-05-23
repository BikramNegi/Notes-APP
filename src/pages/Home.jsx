import React, { useState } from "react";
import { useNotes } from "../context";
import { useNavigate } from "react-router-dom";
import db from "../db";
import { ActionTypes } from "../context";

import { useConnection } from "../hooks/useConnection";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { state, dispatch } = useNotes();
  const navigate = useNavigate();
  const { online, syncing } = useConnection();

  const navigateToEditor = (type, id = null) => {
    if (type === "create") {
      navigate("/note/create");
    } else if (type === "edit" && id) {
      navigate("/note/edit/" + id);
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.notes.delete(id);
      await db.deletedNotes.add({ id });
    } catch (error) {
      throw new Error("Error deleting note: " + error.message);
    }
    dispatch({ type: ActionTypes.DELETE_NOTE, payload: id });
    dispatch({
      type: ActionTypes.ADD_DELETED_NOTES,
      payload: id,
    });
  };

  const filteredNotes = state.notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="home-container">
      <div className="search-create-container">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => navigateToEditor("create")}>Create Note</button>
      </div>
      {syncing && <p>Syncing notes...</p>}
      {state.notes.length > 0 ? (
        <div className="notes-list-container">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div key={note.id} className="note-list-item">
                <span
                  className={`sync-status ${
                    note.synced ? "synced" : "unsynced"
                  }`}
                >
                  {note.synced ? "Synced" : "Unsynced"}
                </span>
                <div
                  className="note-content-container"
                  onClick={() => navigateToEditor("edit", note.id)}
                >
                  <h3>{note.title}</h3>
                  <p>{note.content.substring(0, 100)}...</p>
                </div>

                <div className="note-meta">
                  <div className="note-meta-info">
                    <span>{new Date(note.updatedAt).toLocaleString()}</span>
                  </div>

                  <button onClick={() => handleDelete(note.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <span>No notes found with that search term.</span>
          )}
        </div>
      ) : (
        <p>No notes available</p>
      )}
    </div>
  );
};

export default Home;
