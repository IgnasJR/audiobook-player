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
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Main
                setIsAuthenticated={setIsAuthenticated}
                selectedTrack={selectedTrack}
                selectedAlbum={selectedAlbum}
                setSelectedAlbum={setSelectedAlbum}
                setSelectedTrack={setSelectedTrack}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/addbook"
          element={
            !isAuthenticated ? (
              <Login setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <AddBook setIsAuthenticated={setIsAuthenticated} />
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
