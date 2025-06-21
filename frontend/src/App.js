import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Cookies from "js-cookie";
import AppRoutes from "./Components/AppRoutes";

function App() {
  const [username, setUsername] = useState(Cookies.get("username"));
  const [token, setToken] = useState(Cookies.get("token"));
  const [role, setRole] = useState(Cookies.get("role"));

  const setCookie = (token, role, username) => {
    Cookies.set("token", token, { expires: 7 });
    Cookies.set("role", role, { expires: 7 });
    Cookies.set("username", username, { expires: 7 });
  };

  const removeCookie = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("username");
  };

  return (
    <Router>
      <AppRoutes
        username={username}
        token={token}
        role={role}
        setUsername={setUsername}
        setToken={setToken}
        setRole={setRole}
        setCookie={setCookie}
        removeCookie={removeCookie}
      />
    </Router>
  );
}

export default App;
