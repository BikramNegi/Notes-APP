// src/components/NoteEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useNotes, ActionTypes } from "../context";
import db from "../db";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

const NoteEditor = () => {
  const noteId = useRef(useParams().id);
  const { state, dispatch } = useNotes();
  const [note, setNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("write");

  const debouncedSave = useCallback(
    debounce(async (currentNote) => {
      setIsSaving(true);
      const updatedAt = new Date().toISOString();
      const updatedNote = { ...currentNote, updatedAt, synced: false };

      try {
        await db.notes.put(updatedNote);
      } catch (error) {
        setIsSaving(false);
        throw new Error("Error updating note: " + error.message);
      }

      dispatch({ type: ActionTypes.UPDATE_NOTE, payload: updatedNote });
      setIsSaving(false);
    }, 500),
    []
  );

  useEffect(() => {
    if (noteId.current) {
      const foundNote = state.notes.find((n) => n.id === noteId.current);
      if (foundNote) {
        setNote(foundNote);
      }
    } else {
      noteId.current = uuidv4();
      const newNote = {
        id: noteId.current,
        title: "Untitled Note",
        content: "",
        updatedAt: new Date().toISOString(),
        synced: false,
      };
      setNote(newNote);
      try {
        (async () => {
          db.notes.add(newNote);
        })();
      } catch (error) {
        throw new Error("Error creating note: " + error.message);
      }

      dispatch({ type: ActionTypes.ADD_NOTE, payload: newNote });
    }
  }, [state.notes, dispatch]);

  const handleChange = (field, value) => {
    if (!note) return;

    const updatedNote = { ...note, [field]: value, synced: false };
    setNote(updatedNote);
    debouncedSave(updatedNote);
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div className="note-editor-container">
      <button className="back-button" onClick={() => window.history.back()}>
        Back
      </button>
      <div className="note-editor-header">
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="note-title"
          placeholder="Note title"
        />

        <div className="note-status">
          {isSaving ? "Saving..." : state.online ? "Saved" : "Saved (offline)"}
          {!note.synced && state.online && " - Not synced"}
        </div>
      </div>

      <ReactMde
        value={note.content}
        onChange={(value) => handleChange("content", value)}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
        }
        minEditorHeight={400}
        heightUnits="px"
      />
    </div>
  );
};

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export default NoteEditor;
