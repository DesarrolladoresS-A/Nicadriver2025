import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../database/authcontext";

const ProtectedRoute = ({ element }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;