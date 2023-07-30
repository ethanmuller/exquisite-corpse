import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import AllCorpses from "./AllCorpses.tsx";

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  const { id } = useParams();
  return <h2>Users: {id}</h2>;
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
              <li>
                <Link to="/exquisite-corpse/about">About</Link>
              </li>
              <li>
                <Link to="/exquisite-corpse/users">Users</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/exquisite-corpse/" element={<Home />} />
            <Route path="/exquisite-corpse/about" element={<About />} />
            <Route path="/exquisite-corpse/users" element={<Users />} />
            <Route path="/exquisite-corpse/:id" element={<Users />} />
          </Routes>
          <AllCorpses />
        </div>
      </Router>
    </>
  );
}

export default App;
