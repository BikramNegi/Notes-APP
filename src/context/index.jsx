import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import db from "../db";
import PropTypes from "prop-types";

export const ActionTypes = {
  SET_NOTES: "SET_NOTES",
  ADD_NOTE: "ADD_NOTE",
  UPDATE_NOTE: "UPDATE_NOTE",
  DELETE_NOTE: "DELETE_NOTE",
  SET_LOADING: "SET_LOADING",
  SET_ONLINE: "SET_ONLINE",
  SET_SYNCING: "SET_SYNCING",
};

const initialState = {
  notes: [],
  loading: true,
  online: navigator.onLine,
  syncing: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_NOTES:
      return { ...state, notes: action.payload };
    case ActionTypes.ADD_NOTE:
      return { ...state, notes: [action.payload, ...state.notes] };
    case ActionTypes.UPDATE_NOTE:
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case ActionTypes.DELETE_NOTE:
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ONLINE:
      return { ...state, online: action.payload };
    case ActionTypes.SET_SYNCING:
      return { ...state, syncing: action.payload };
    default:
      return state;
  }
};

const NotesContext = createContext({
  state: initialState,
  dispatch: () => null,
});

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadNotes = async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const notes = await db.notes.toArray();
      dispatch({ type: ActionTypes.SET_NOTES, payload: notes });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    };

    loadNotes();
  }, []);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
};
export const useNotes = () => useContext(NotesContext);

NotesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
