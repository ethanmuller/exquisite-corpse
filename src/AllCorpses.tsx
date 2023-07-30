import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";

export default function Component(props) {
  const [gameList, setGameList] = useState([])

  useEffect(() => {
    async function getAll() {
      const response = await fetch("http://localhost:3000/exquisite-corpse/api/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json()
      setGameList(json)
    }
    getAll()
  }, [])

  return (
    <ul>
    {gameList.map(i => <li key={i.id}><Link to={`/exquisite-corpse/${i.id}`}>yuh</Link></li>)}
    </ul>
  )
}
