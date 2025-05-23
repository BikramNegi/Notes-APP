import { useNavigate } from "react-router-dom";
import { useNotes } from "../context";

const Header = () => {
  const navigate = useNavigate();
  const { state } = useNotes();
  return (
    <header className="header">
      <h1 className="header__title" onClick={() => navigate("/")}>
        Notes App
      </h1>
      {state.online ? (
        <div className="online_status">
          <span className="online">Online</span>
        </div>
      ) : (
        <div className="online_status">
          <span className="offline">Offline</span>
        </div>
      )}
      {state.syncing && (
        <div className="syncing_status">
          <span className="syncing">Syncing...</span>
        </div>
      )}
    </header>
  );
};

export default Header;
