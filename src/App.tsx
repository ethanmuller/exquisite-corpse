import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import AllCorpses from "./AllCorpses.tsx";
import Corpse from "./Corpse.tsx";

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function App() {
  return (
    <>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/exquisite-corpse/">Home</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/exquisite-corpse/" element={<AllCorpses />} />
            <Route path="/exquisite-corpse/:id" element={<Corpse width={320} height={320} />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
