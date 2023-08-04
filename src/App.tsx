import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import AllCorpses from "./AllCorpses.tsx";
import Corpse from "./Corpse.tsx";

function Index() {
  const navigate = useNavigate()

  async function create() {
      fetch(`${import.meta.env.VITE_SERVER_URL}api/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(data => data.json())
      .then((game) => navigateToGame(game))
  }

  function navigateToGame(game) {
    navigate(`/exquisite-corpse/${game.id}?part=head`)
  }

  return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><button onClick={create}>Start new corpse</button></div>
}

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/exquisite-corpse/" element={<Index />} />
            <Route path="/exquisite-corpse/all" element={<AllCorpses />} />
            <Route path="/exquisite-corpse/:id" element={<Corpse width={320} height={320} />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
