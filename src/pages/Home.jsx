import React from "react";
import { useNotes } from "../context";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { state, dispatch } = useNotes();
  const navigate = useNavigate();

  const navigateToEditor = (type, id = null) => {
    if (type === "create") {
      navigate("/note/create");
    } else if (type === "edit" && id) {
      navigate("/note/edit/" + id);
    }
  };

  return (
    <div>
      <button onClick={() => navigateToEditor("create")}>Create Note</button>
      {state.notes.length > 0 ? (
        <ul>
          {state.notes.map((note) => (
            <li key={note.id} onClick={() => navigateToEditor("edit", note.id)}>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
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
