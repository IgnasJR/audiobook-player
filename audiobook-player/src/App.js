import "./output.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React, { useState } from "react";
import Main from "./Pages/Main";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import AddBook from "./Pages/AddBook";

function App() {
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

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
