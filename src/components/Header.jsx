import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="header">
      <h1 className="header__title" onClick={() => navigate("/")}>
        Notes App
      </h1>
    </header>
  );
};

export default Header;
