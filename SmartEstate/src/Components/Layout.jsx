import React from "react";
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <Outlet /> {/* This is where nested routes will render */}
      </div>
    </>
  );
};

export default Layout;
