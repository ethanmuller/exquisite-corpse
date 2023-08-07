import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DrawingPad from "./DrawingPad.tsx";
import { useNavigate } from "react-router-dom";

const parts = ["head", "body", "feet"];

function partToState(part: string | null): GameState {
  if (part) {
    return parts.indexOf(part);
  }
  return -1;
}

export default function Corpse(props) {
  const [game, setGame] = useState({});
  const [continued, setContinued] = useState(false);
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
        setGame(json);
      })
      .catch((e) => setError("404: CORPSE NOT FOUND 💀"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (part && parts.indexOf(part) < 0) {
      setError("ERROR: INVALID BODY PART");
    }
  }, [part]);

  function Cta(props) {
    const navigate = useNavigate();

    async function create() {
      fetch(`${import.meta.env.VITE_SERVER_URL}api/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((data) => data.json())
        .then((game) => navigateToGame(game));
    }

    function navigateToGame(game) {
      setGame(game);
      navigate(`/exquisite-corpse/${game.id}?part=head`);
    }

    return (
      <button className="btn__primary" onClick={create}>
        Start new corpse
      </button>
    );
  }

  const imgStyle = {
    maxWidth: "100%",
    display: "block",
  };

  const intro = [
    <>You must draw a head.</>,
    <>
      A head has been drawn.
      <br />
      <strong>You will draw the body.</strong>
      <br />
      The next person will
      <br />
      then draw the feet.
    </>,
    <>
      A head and a body
      <br />
      have been drawn.
      <br />
      <strong>You will draw the feet.</strong>
    </>,
  ];

  function FullCorpse(props) {
    return game.gameState >= 3 ? (
      <>
        <div className="smooth-shadow" style={{ background: "white" }}>
          <div style={{ width: "28vh", textAlign: "center", margin: "0 auto" }}>
            <img
              style={imgStyle}
              src={`${import.meta.env.VITE_SERVER_URL}img/${id}/full.png`}
            />
          </div>
        </div>
        <div style={{ padding: "2rem 0 4rem", textAlign: "center" }}>
          <Cta />
        </div>
      </>
    ) : (
      <div>
        The finished corpse will be here when it is finished. Please refresh the
        page.
      </div>
    );
  }

  function Intro(props) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>{intro[props.viewingState]}</div>
        <div style={{ margin: "2rem 0 0" }}>
          <button className="btn__primary" onClick={() => setContinued(true)}>
            I understand
          </button>
        </div>
      </div>
    );
  }

  function View(props) {
    if (error)
      return (
        <div
          style={{
            height: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {error}
        </div>
      );
    if (!part) {
      return <FullCorpse />;
    }

    const viewingState = partToState(part);

    if (viewingState > 0 && !continued) {
      return <Intro viewingState={viewingState} />;
    }

    return <DrawingPad {...props} game={game} setGame={setGame} />;
  }

  function Loader(props) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return loading ? <Loader /> : <View {...props} />;
}
