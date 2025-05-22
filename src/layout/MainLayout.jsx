import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <Header />
      {/* This is where the main content will be rendered */}
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
