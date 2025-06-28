import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import Main from "../Pages/Main";
import Login from "../Pages/Login";
import AddBook from "../Pages/AddBook";
import ViewAlbum from "../Pages/ViewAlbum";
import NotFound from "../Pages/NotFound";
import RequireAuth from "./RequireAuth";
import ManageAlbums from "../Pages/ManageAlbums";
import ManageUsers from "../Pages/ManageUsers";

function AppRoutes({
  username,
  token,
  role,
  setUsername,
  setToken,
  setRole,
  removeCookie,
  setCookie,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const notificationData = location.state?.toast;
    if (notificationData) {
      toast[notificationData.type || "info"](notificationData.message, {
        position: "bottom-right",
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    if (error) {
      if (error.type === "error") {
        toast.error(error.message, {
          position: "bottom-right",
        });
      } else if (error.type === "info") {
        toast.info(error.message, {
          position: "bottom-right",
        });
      } else if (error.type === "success") {
        toast.success(error.message, {
          position: "bottom-right",
        });
      }
      setError(null);
    }
  }, [error]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth permissionLvl={1}>
              <Main
                token={token}
                username={username}
                role={role}
                setUsername={setUsername}
                setToken={setToken}
                setRole={setRole}
                removeCookie={removeCookie}
                setError={setError}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/login"
          element={
            <Login
              setUsername={setUsername}
              setToken={setToken}
              setRole={setRole}
              setCookie={setCookie}
              setError={setError}
            />
          }
        />
        <Route
          path="/addbook"
          element={
            token === null ? (
              <Navigate to="/login" />
            ) : (
              <RequireAuth permissionLvl={2}>
                <AddBook
                  username={username}
                  token={token}
                  role={role}
                  setUsername={setUsername}
                  setToken={setToken}
                  setRole={setRole}
                  removeCookie={removeCookie}
                />
              </RequireAuth>
            )
          }
        />
        <Route
          path="/album/:id"
          element={
            token === null ? (
              <Navigate to="/login" />
            ) : (
              <ViewAlbum token={token} setError={setError} />
            )
          }
        />
        <Route
          path="/manage-users"
          element={
            <RequireAuth permissionLvl={2}>
              <ManageUsers token={token}></ManageUsers>
            </RequireAuth>
          }
        />
        <Route
          path="/manage-albums"
          element={
            <RequireAuth permissionLvl={2}>
              <ManageAlbums></ManageAlbums>
            </RequireAuth>
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="/*" element={<Navigate to="/404" />} />
      </Routes>
    </>
  );
}
export default AppRoutes;
