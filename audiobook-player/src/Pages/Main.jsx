import React from "react";
import { useState } from "react";
import Header from "../Components/Header";
import Selector from "../Components/Selector";
import Player from "../Components/Player";

function Main({ setIsAuthenticated, setSelectedAlbum, setSelectedTrack, selectedTrack}) {
  return (
    <div className="App bg-inherit">
      {/* <Header setIsAuthenticated={setIsAuthenticated} /> */}
      <Selector
        setSelectedAlbum={setSelectedAlbum}
        setSelectedTrack={setSelectedTrack}
        selectedTrack={selectedTrack}
      />
      <Player selectedTrack={selectedTrack} />
    </div>
  );
}

export default Main;
