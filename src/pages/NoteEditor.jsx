// src/components/NoteEditor.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { useNotes } from "../context";
import db from "../db";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

const NoteEditor = () => {
  console.log("NoteEditor rendered");
  const noteId = useRef(useParams().id);
  const { state, dispatch } = useNotes();
  const [note, setNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("write"); // 'write' or 'preview'

  // Debounce save function
  const debouncedSave = useCallback(
    debounce(async (currentNote) => {
      setIsSaving(true);
      const updatedAt = new Date().toISOString();
      const updatedNote = { ...currentNote, updatedAt, synced: false };

      await db.notes.put(updatedNote);
      dispatch({ type: "UPDATE_NOTE", payload: updatedNote });
      setIsSaving(false);
    }, 500),
    []
  );

  useEffect(() => {
    console.log("NoteEditor useEffect");
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
      db.notes.add(newNote);
      dispatch({ type: "ADD_NOTE", payload: newNote });
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
    <div className="note-editor">
      <input
        type="text"
        value={note.title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="note-title"
        placeholder="Note title"
      />
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
      <div className="note-status">
        {isSaving ? "Saving..." : state.online ? "Saved" : "Saved (offline)"}
        {!note.synced && state.online && " - Not synced"}
      </div>
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
