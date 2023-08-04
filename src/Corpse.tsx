import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DrawingPad from "./DrawingPad.tsx";

export default function Corpse(props) {
  const [game, setGame] = useState({});
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const part = searchParams.get("part");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}api/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((json) => setGame(json));
  }, []);

  function FullCorpse(props) {
    return game.gameState >= 3 ? (
      <div style={{width: 320}}>
        <img src={`${import.meta.env.VITE_SERVER_URL}img/${id}/head.png`} />
        <img src={`${import.meta.env.VITE_SERVER_URL}img/${id}/body.png`} />
        <img src={`${import.meta.env.VITE_SERVER_URL}img/${id}/feet.png`} />
      </div>
    ) : <div>not done yet</div>
  }

  return part ? (
    <DrawingPad {...props} game={game} setGame={setGame} />
  ) : (
    <FullCorpse />
  );
}
