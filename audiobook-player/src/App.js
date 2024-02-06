import "./App.css";
import Player from "./Player";
import React, { useState } from "react";

function App() {
  const [selectedTrack, setSelectedTrack] = useState(8);

  return (
    <div className="App">
      <h1>Audiobook Player</h1>
      <Player
        src={`${window.location.protocol}//${window.location.hostname}:3001/api/retrieve?id=${selectedTrack}`}
      />
    </div>
  );
}

export default App;
