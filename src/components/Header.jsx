import { useNavigate } from "react-router-dom";
import { useConnection } from "../hooks/useConnection";

const Header = () => {
  const navigate = useNavigate();
  const { online, syncing } = useConnection();
  return (
    <header className="header">
      <h1 className="header__title" onClick={() => navigate("/")}>
        Notes App
      </h1>
      {online ? (
        <div className="online_status">
          <span className="online">Online</span>
        </div>
      ) : (
        <div className="online_status">
          <span className="offline">Offline</span>
        </div>
      )}
      {syncing && (
        <div className="syncing_status">
          <span className="syncing">Syncing...</span>
        </div>
      )}
    </header>
  );
};

export default Header;
