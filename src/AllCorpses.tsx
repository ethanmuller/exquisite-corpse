import { useState, useEffect } from 'react'
import { Link } from "react-router-dom";

function getPart(state) {
  switch (state) {
    case 'PleaseDrawHead':
      return 'head'
      break;
    case 'PleaseDrawBody':
      return 'body'
      break;
    case 'PleaseDrawFeet':
      return 'feet'
      break;
    case 'Done':
      return
      break;
  }
}

function Corpse(props) {
  const part = getPart(props.gameState)
  return <Link to={`/exquisite-corpse/${props.id}${part ? `?part=${part}` : ''}`}>{props.id} {props.gameState}{}</Link>
}

export default function Component(props) {
  const [gameList, setGameList] = useState([])

  useEffect(() => {
    async function getAll() {
      const response = await fetch("https://mush.network/exquisite-corpse/api/all", {
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
    {gameList.map(i => <li key={i.id}><Corpse id={i.id} gameState={i.gameState} /></li>)}
    </ul>
  )
}
