import "./output.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Cookies from "js-cookie";
import React, { useState } from "react";
import Main from "./Pages/Main";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import AddBook from "./Pages/AddBook";

function App() {
  const [username, setUsername] = useState(Cookies.get("username"));
  const [token, setToken] = useState(Cookies.get("token"));
  const [role, setRole] = useState(Cookies.get("role"));

  const setCookie = (token, role, username) => {
    Cookies.set("token", token, { expires: 7, secure: false });
    Cookies.set("role", role, { expires: 7, secure: false });
    Cookies.set("username", username, { expires: 7, secure: false });
  };
  const removeCookie = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("username");
  };

  return (
    <Router>
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
              <AddBook
                username={username}
                token={token}
                role={role}
                setUsername={setUsername}
                setToken={setToken}
                setRole={setRole}
              />
            )
          }
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="/*" element={<Navigate to="/404" />} />
      </Routes>
    </Router>
  );
}

export default App;
