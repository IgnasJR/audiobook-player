import "./App.css";
import Player from "./Player";

function App() {
  return (
    <div className="App">
      <h1>Audiobook Player</h1>
      <Player src="http://localhost:3001/api/test/1?song=1.mp3" />
    </div>
  );
}

export default App;
