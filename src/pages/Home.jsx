import React, { useState } from "react";
import { useNotes } from "../context";
import { useNavigate } from "react-router-dom";
import db from "../db";
import { ActionTypes } from "../context";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { state, dispatch } = useNotes();
  const navigate = useNavigate();

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
    } catch (error) {
      throw new Error("Error deleting note: " + error.message);
    }
    dispatch({ type: ActionTypes.DELETE_NOTE, payload: id });
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
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button onClick={() => navigateToEditor("create")}>Create Note</button>
      {state.notes.length > 0 ? (
        <ul>
          {filteredNotes.map((note) => (
            <li key={note.id} className="note-item">
              <h3>{note.title}</h3>
              <p>{note.content.substring(0, 100)}...</p>
              <div className="note-meta">
                <span>{new Date(note.updatedAt).toLocaleString()}</span>
                <span
                  className={`sync-status ${
                    note.synced ? "synced" : "unsynced"
                  }`}
                >
                  {note.synced ? "Synced" : "Unsynced"}
                </span>
                <button onClick={() => handleDelete(note.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notes available</p>
      )}
    </div>
  );
};

export default Home;
