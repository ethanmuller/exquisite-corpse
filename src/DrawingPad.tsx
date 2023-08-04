import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Thing as Url } from "./Asdf.js";

type GameState = number;

const parts = ["head", "body", "feet"];

function partToState(part: string | null): GameState {
  if (part) {
    return parts.indexOf(part);
  }
  return -1
}

function stateToPart(state: GameState): string {
  return parts[state];
}

export default function DrawingPad(props) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const part = searchParams.get("part");
  const [isViewingPageForActiveState, setIsViewingPageForActiveState] =
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
    const { top, left } = event.target.getBoundingClientRect();
    const localX = event.clientX - left;
    const localY = event.clientY - top;
    // setStrokes([ ...strokes, [localX, localY]])
    setCurrentStroke([[localX, localY]]);
  }

  function handlePointerMove(event) {
    if (!enabled) return;
    if (currentStroke.length > 0) {
      const { top, left } = event.target.getBoundingClientRect();
      const localX = event.clientX - left;
      const localY = event.clientY - top;
      setCurrentStroke([...currentStroke, [localX, localY]]);
    }
  }

  function handlePointerUp(event) {
    if (!enabled) return;
    setStrokes([...strokes, currentStroke]);
    setCurrentStroke([]);
  }

  // local persistence for strokes
  useEffect(() => {
    localStorage.setItem(`strokes-${part}-${id}`, JSON.stringify(strokes));
  }, [strokes]);

  useEffect(() => {
    setIsViewingPageForActiveState(partToState(part) === props.game.gameState);
  }, [props.game, part]);

  useEffect(() => {
    setEnabled(isViewingPageForActiveState);
  }, [isViewingPageForActiveState]);


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

      if (strokes.length > 0) {
        ctx.beginPath();
        for (let n = 0; n < strokes.length; n++) {
          const s = strokes[n];
          ctx.moveTo(s[0][0], s[0][1]);
          for (let p = 0; p < s.length; p++) {
            ctx.lineTo(s[p][0], s[p][1]);
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
      canvas.addEventListener("pointerdown", handlePointerDown);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerup", handlePointerUp);

      return () => {
        canvas.removeEventListener("pointerdown", handlePointerDown);
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerup", handlePointerUp);
      };
    }
  });

  function Controls(props) {
    return (
      <div>
        <button onClick={done}>All Done</button>
        <button onClick={clear}>Clear</button>
      </div>
    );
  }

  function PreviousSliver(props) {
    return (
      <img
        style={{
          width: props.width,
          height: "50px",
          objectFit: "cover",
          objectPosition: "bottom",
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

  function Prompt() {
    return <div>Please draw {part}</div>
  }

  const isAfterFirstPart = partToState(part) > 0

  return (
    <div>
      {isAfterFirstPart ? (
        <PreviousSliver width={props.width} part={part} />
      ) : null}
      <canvas
        style={{ touchAction: "none" }}
        ref={canvasRef}
      ></canvas>
      {isViewingPageForActiveState ? (
        <div>
          <Prompt />
          <Controls />
        </div>
      ) : (
        <Url viewingPart={part} game={props.game} />
      )}
    </div>
  );
}
