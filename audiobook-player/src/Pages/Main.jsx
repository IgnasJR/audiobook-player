import React from "react";
import { useState } from "react";
import Header from "../Components/Header";
import Selector from "../Components/Selector";
import Player from "../Components/Player";

function Main({ setIsAuthenticated}) {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  return (
    <div className="App bg-inherit">
      <Header setIsAuthenticated={setIsAuthenticated} />
      <Selector
        setSelectedAlbum={setSelectedAlbum}
        setSelectedTrack={setSelectedTrack}
        selectedTrack={selectedTrack}
      />
    </div>
  );
}

export default Main;
