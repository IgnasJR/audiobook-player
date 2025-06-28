import React from "react";
import Cookies from "js-cookie";
import { Navigate, useLocation } from "react-router-dom";

// permissionLvl: 0 = all, 1 = logged in, 2 = admin
function RequireAuth({ permissionLvl, children }) {
  const token = Cookies.get("token");
  const role = Cookies.get("role");
  const location = useLocation();

  switch (permissionLvl) {
    case 0:
      break;
    case 1:
      if (!token) {
        return (
          <Navigate
            to="/login"
            state={{
              from: location,
              toast: {
                message: "You must be logged in to access this page.",
                type: "error",
              },
            }}
            replace
          />
        );
      }
      break;
    case 2:
      if (!token || role !== "admin") {
        return (
          <Navigate
            to="/"
            state={{
              from: location,
              toast: {
                message: "Admin access required.",
                type: "error",
              },
            }}
            replace
          />
        );
      }
  }

  return children;
}

export default RequireAuth;
