import "./output.css";
import Player from "./Player";
import Selector from "./Selector";
import React, { useState } from "react";

function App() {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  return (
    <div className="App">
      <Selector
        setSelectedAlbum={setSelectedAlbum}
        setSelectedTrack={setSelectedTrack}
      />
      <Player selectedTrack={selectedTrack} />
    </div>
  );
}

export default App;
