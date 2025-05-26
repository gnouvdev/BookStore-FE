import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Kiểm tra token và role admin
  if (!token || user.role !== "admin") {
    return <Navigate to="/admin" />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
