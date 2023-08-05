import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DrawingPad from "./DrawingPad.tsx";
import { useNavigate } from "react-router-dom";

export default function Corpse(props) {
  const [game, setGame] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      .then((json) => {
          setGame(json)
      })
      .catch(e => setError('404: CORPSE NOT FOUND 💀'))
      .finally(() => setLoading(false))
  }, []);

  function Cta(props) {
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
      setGame(game)
      navigate(`/exquisite-corpse/${game.id}?part=head`)
    }

    return <button className='btn__primary' onClick={create}>Start new corpse</button>
  }

  function FullCorpse(props) {
    return game.gameState >= 3 ? (
      <div style={{width: 320, textAlign: 'center', margin: '0 auto'}}>
        <img src={`${import.meta.env.VITE_SERVER_URL}img/${id}/head.png`} />
        <img src={`${import.meta.env.VITE_SERVER_URL}img/${id}/body.png`} />
        <img src={`${import.meta.env.VITE_SERVER_URL}img/${id}/feet.png`} />
        <div style={{margin: '3rem 0'}}><Cta /></div>
      </div>
    ) : <div>not done yet</div>
  }

  function View(props) {
    if (error) return (
        <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{error}</div>
        )
    return part ? (
      <DrawingPad {...props} game={game} setGame={setGame} />
    ) : (
      <FullCorpse />
    );
  }

  function Loader(props) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>
    )
  }

  return loading ? <Loader /> : <View {...props} />

}
