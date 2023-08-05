import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { NextSteps } from "./NextSteps.js";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Link } from "react-router-dom";

type GameState = number;

const parts = ["head", "body", "feet"];

function partToState(part: string | null): GameState {
  if (part) {
    return parts.indexOf(part);
  }
  return -1;
}

function stateToPart(state: GameState): string {
  return parts[state];
}

export default function DrawingPad(props) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const part = searchParams.get("part");
  const [isViewingPageForLatestState, setIsViewingPageForLatestState] =
    useState(true);
  const [strokes, setStrokes] = useState<any[]>(
    JSON.parse(localStorage.getItem(`strokes-${part}-${id}`) || "[]")
  );
  const [enabled, setEnabled] = useState(true);
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function clear() {
    setStrokes([]);
  }

  async function done() {
    const canvas = canvasRef.current;
    const base64image = canvas?.toDataURL();
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}api/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64image,
          part,
        }),
      }
    );

    const data = await response.json();
    props.setGame(data);
  }

  function handlePointerDown(event) {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const { top, left } = canvas?.getBoundingClientRect();
    const localX = event.clientX - left;
    const localY = event.clientY - top;
    // setStrokes([ ...strokes, [localX, localY]])
    setCurrentStroke([[localX, localY]]);
  }

  function handlePointerMove(event) {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (currentStroke.length > 0) {
      const { top, left } = canvas?.getBoundingClientRect();
      const localX = event.clientX - left;
      const localY = event.clientY - top;
      setCurrentStroke([...currentStroke, [localX, localY]]);
    }
  }

  function handlePointerUp(event) {
    if (!enabled) return;
    if (currentStroke.length > 0) {
      setStrokes([...strokes, currentStroke]);
      setCurrentStroke([]);
    }
  }

  // local persistence for strokes
  useEffect(() => {
    localStorage.setItem(`strokes-${part}-${id}`, JSON.stringify(strokes));
  }, [strokes]);

  useEffect(() => {
    setIsViewingPageForLatestState(partToState(part) === props.game.gameState);
  }, [props.game, part]);

  useEffect(() => {
    setEnabled(isViewingPageForLatestState);
  }, [isViewingPageForLatestState]);

  // set scale for hidpi displays
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const ratio = 2;
    if (canvas && ctx) {
      canvas.width = props.width * ratio;
      canvas.height = props.height * ratio;
      canvas.style.width = props.width + "px";
      canvas.style.height = props.height + "px";
      ctx.scale(ratio, ratio);
    }
  }, []);

  // draw strokes from state
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round'

      if (strokes.length > 0) {
        ctx.beginPath();
        for (let n = 0; n < strokes.length; n++) {
          const s = strokes[n];
          if (s[0]) {
            ctx.moveTo(s[0][0], s[0][1]);
            for (let p = 0; p < s.length; p++) {
              ctx.lineTo(s[p][0], s[p][1]);
            }
          }
        }
        ctx.stroke();
      }

      if (currentStroke.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentStroke[0][0], currentStroke[0][1]);
        for (let i = 0; i < currentStroke.length; i++) {
          ctx.lineTo(currentStroke[i][0], currentStroke[i][1]);
        }
        ctx.stroke();
      }
    }
  }, [strokes, currentStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      window.addEventListener("pointerdown", handlePointerDown);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      return () => {
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  });

  function PreviousSliver(props) {
    return (
      <img
        style={{
          width: props.width,
          height: "50px",
          objectFit: "cover",
          objectPosition: "bottom",
          pointerEvents: 'none',
        }}
        src={`${import.meta.env.VITE_SERVER_URL}img/${id}/${
          parts[parts.indexOf(props.part) - 1]
        }.png`}
      />
    );
  }

  function FullCorpse(props) {
    return (
      <div style={{ width: "320px" }}>
        <img src={`${import.meta.env.VITE_SERVER_URL}/${id}/head.png`} />
        <img src={`${import.meta.env.VITE_SERVER_URL}/${id}/body.png`} />
        <img src={`${import.meta.env.VITE_SERVER_URL}/${id}/feet.png`} />
      </div>
    );
  }

  function CopyPrompt(props) {
    const [copied, setCopied] = useState(false);

    return (
      <div>
        <label>
          <div>{props.part} done! next step:</div>
          <input
            readOnly
            type="text"
            value={`${import.meta.env.VITE_CLIENT_URL}${
              props.game.id
            }?part=${stateToPart(props.game.gameState)}`}
          />
        </label>
        <CopyToClipboard
          text={`${import.meta.env.VITE_CLIENT_URL}${
            props.game.id
          }?part=${stateToPart(props.game.gameState)}`}
          onCopy={() => setCopied(true)}
        >
          <button>Copy</button>
        </CopyToClipboard>
        {copied ? <span style={{ color: "green" }}> Copied!</span> : null}
      </div>
    );
  }

  function DrawPrompt(props) {
    return <div>Please draw <strong>the {props.part}</strong></div>
  }

  function LinkToFullCorpse(props) {
    return (
      <div>
        <div>Corpse complete!</div>
        <Link to={`/exquisite-corpse/${props.game.id}`}>View Full Corpse</Link>
      </div>
    );
  }

  function CallToAction(props) {
    const views = {
      DRAW: DrawPrompt,
      COPY: CopyPrompt,
      FINAL_LINK: LinkToFullCorpse,
    }

    let view;

    if (props.game.gameState === 3) {
      view = 'FINAL_LINK'
    } else if (props.isThisPartOver) {
      view = 'COPY'
    } else {
      view = 'DRAW'
    }

    const CurrentView = views[view]

    return <CurrentView {...props} />
  }

  const isAfterFirstPart = partToState(part) > 0;

  return (
    <div style={{touchAction: 'none', textAlign: 'center'}}>
      <CallToAction part={part} game={props.game} isThisPartOver={!isViewingPageForLatestState} />
      {isAfterFirstPart ? (
        <PreviousSliver width={props.width} part={part} />
      ) : null}
      <canvas style={{ touchAction: "none" }} ref={canvasRef}></canvas>

      <NextSteps
        part={part}
        game={props.game}
        isThisPartOver={!isViewingPageForLatestState}
        onDone={done}
        onClear={clear}
      />
    </div>
  );
}
