import React from "react";
import { useState } from "react";
import Header from "../Components/Header";
import Selector from "../Components/Selector";
import Notification from "../Components/Notification";

function Main({ setIsAuthenticated}) {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationType, setNotificationType] = useState("error");
  const [headerPresent, setHeaderPresent] = useState(false);
  setTimeout (() => setHeaderPresent(false), 3500);

  return (
    <div className="App bg-inherit">
      {notificationContent ? (
        <Notification
          notificationContent={notificationContent}
          notificationType={notificationType}
          headerPresent={headerPresent}
        />
      ) : null}
      <Header setIsAuthenticated={setIsAuthenticated} />
      <Selector
        setSelectedAlbum={setSelectedAlbum}
        setSelectedTrack={setSelectedTrack}
        selectedTrack={selectedTrack}
        setNotificationContent={setNotificationContent}
        setNotificationType={setNotificationType}
        setHeaderPresent={setHeaderPresent}
      />
    </div>
  );
}

export default Main;
