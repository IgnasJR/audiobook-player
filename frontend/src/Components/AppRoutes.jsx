import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
  } from "react-router-dom";
  import { ToastContainer, toast } from "react-toastify";
  import 'react-toastify/dist/ReactToastify.css';
  import React, { useEffect, useState } from "react";

import Main from "../Pages/Main";
import Login from "../Pages/Login";
import AddBook from "../Pages/AddBook";
import ViewAlbum from "../Pages/ViewAlbum";
import NotFound from "../Pages/NotFound";
import RequireAuth from "./RequireAuth";
  
  function AppRoutes({ username, token, role, setUsername, setToken, setRole, removeCookie, setCookie }) {
    const location = useLocation();
  
    useEffect(() => {
      const notificationData = location.state?.toast;
      if (notificationData) {
        toast[notificationData.type || "info"](notificationData.message, {
          position: "bottom-right",
        });
      }
    }, [location.state]);
  
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={
              <Main
                username={username}
                token={token}
                role={role}
                setUsername={setUsername}
                setToken={setToken}
                setRole={setRole}
                removeCookie={removeCookie}
              />
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
              />
            }
          />
          <Route
            path="/addbook"
            element={
              token === null ? (
                <Login
                  setUsername={setUsername}
                  setToken={setToken}
                  setRole={setRole}
                  removeCookie={removeCookie}
                />
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
          <Route path="/album/:id" element={<ViewAlbum token={token} />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/*" element={<Navigate to="/404" />} />
        </Routes>
      </>
    );
  }
export default AppRoutes;