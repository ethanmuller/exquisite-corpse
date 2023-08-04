import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";

const parts = [
  'head',
  'body',
  'feet',
]

function getPart(state) {
  return parts[state]
}

function Corpse(props) {
  const part = getPart(props.gameState)
  return <Link to={`/exquisite-corpse/${props.id}${part ? `?part=${part}` : ''}`}>{props.id} {props.gameState}{}</Link>
}

export default function Component(props) {
  const [gameList, setGameList] = useState([])

  useEffect(() => {
    async function getAll() {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}api/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const json = await response.json()
        setGameList(json)
      } catch (e) {
        console.error('ERROR FETCHING LIST OF GAMES\n', e)
      }
    }
    getAll()
  }, [])

  return (
    <ul>
    {gameList.map(i => <li key={i.id}><Corpse id={i.id} gameState={i.gameState} /></li>)}
    </ul>
  )
}
