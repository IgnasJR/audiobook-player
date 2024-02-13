import "./output.css";
import Player from "./Components/Player";
import Selector from "./Components/Selector";
import React, { useState } from "react";

function App() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  let isAuthenticated = true;

  return (
    <div className="App bg-inherit">
      {isAuthenticated ? (
        <>
          <Selector
            setSelectedAlbum={setSelectedAlbum}
            setSelectedTrack={setSelectedTrack}
          />
          <Player selectedTrack={selectedTrack} />
        </>
      ) : (
        <h1>Not authenticated</h1>
      )}
    </div>
  );
}

export default App;
