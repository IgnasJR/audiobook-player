import React from "react";
import { useState } from "react";
import Header from "../Components/Header";
import Selector from "../Components/Selector";

function Main({ token, username, role, setToken, setUsername, setRole, removeCookie, setError}) {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  return (
    <div className="App bg-inherit">
      <Header token={token} setToken={setToken} username={username} setUsername={setUsername} role={role} setRole={setRole} removeCookie={removeCookie}  />
      <Selector
        setSelectedAlbum={setSelectedAlbum}
        setSelectedTrack={setSelectedTrack}
        selectedTrack={selectedTrack}
        setError={setError}
        selectedAlbum={selectedAlbum}
        token={token}
        removeCookie={removeCookie}
      />
    </div>
  );
}

export default Main;
