import "./output.css";
import Selector from "./Components/Selector";
import React, { useState } from "react";
import Header from "./Components/Header";

function App() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  let isAuthenticated = true;

  return (
    <div className="App bg-inherit">
      {isAuthenticated ? (
        <>
          <Header />
          <Selector
            setSelectedAlbum={setSelectedAlbum}
            setSelectedTrack={setSelectedTrack}
            selectedTrack={selectedTrack}
          />
        </>
      ) : (
        <h1>Not authenticated</h1>
      )}
    </div>
  );
}

export default App;
