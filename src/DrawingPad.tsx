import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from 'react-router-dom';
import { Thing } from './Asdf.js'

type Part = 'head' | 'body' | 'feet'
type GameState = number

const parts = [
  'head',
  'body',
  'feet',
]

function partToState(part: Part):GameState {
  return parts.indexOf(part)
}

function stateToPart(state: GameState):Part {
  return parts[state]
}

export default function (props) {
  const { id } = useParams()
  const [ searchParams ] = useSearchParams()
  const part = searchParams.get('part')
  const [ isViewingPageForActiveState, setIsViewingPageForActiveState ] = useState(true)
  const [strokes, setStrokes] = useState<any[]>(
    JSON.parse(localStorage.getItem(`strokes-${part}-${id}`) || "[]")
  );
  const [game, setGame] = useState({})
  const [enabled, setEnabled] = useState(true)
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function clear() {
    setStrokes([]);
  }

  async function done() {
    const canvas = canvasRef.current;
    const base64image = canvas?.toDataURL();
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}api/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64image,
        part,
      }),
    });

    const data = await response.json()
    setGame(data)
  }

  function handlePointerDown(event) {
    if (!enabled) return
    const { top, left } = event.target.getBoundingClientRect();
    const localX = event.clientX - left;
    const localY = event.clientY - top;
    // setStrokes([ ...strokes, [localX, localY]])
    setCurrentStroke([[localX, localY]]);
  }

  function handlePointerMove(event) {
    if (!enabled) return
    if (currentStroke.length > 0) {
      const { top, left } = event.target.getBoundingClientRect();
      const localX = event.clientX - left;
      const localY = event.clientY - top;
      setCurrentStroke([...currentStroke, [localX, localY]]);
    }
  }

  function handlePointerUp(event) {
    if (!enabled) return
    setStrokes([...strokes, currentStroke]);
    setCurrentStroke([]);
  }

  // local persistence for strokes
  useEffect(() => {
    localStorage.setItem(`strokes-${part}-${id}`, JSON.stringify(strokes));
  }, [strokes]);

  useEffect(() => {
   setIsViewingPageForActiveState(partToState(part) === game.gameState)
  }, [game, part]);

  useEffect(() => {
   setEnabled(isViewingPageForActiveState)
  }, [isViewingPageForActiveState]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}api/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(data => data.json())
      .then(json => setGame(json))
  }, []);

  // set scale for hidpi displays
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const ratio = 2;
    if (canvas) {
      canvas.width = props.width * ratio;
      canvas.height = props.height * ratio;
      canvas.style.width = props.width + "px";
      canvas.style.height = props.height + "px";
    }
    ctx?.scale(ratio, ratio);
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


  function Controls (props) {
    return (
      <div>
      <button onClick={done}>All Done</button>
      <button onClick={clear}>Clear</button>
      </div>
    )
  }

  function PreviousSliver(props) {
    return <img style={{width: props.width, height: '50px', objectFit: 'cover', objectPosition: 'bottom'}} src={`${import.meta.env.VITE_SERVER_URL}/${id}/${parts[parts.indexOf(props.part)-1]}.png`} />
  }

  return (
    <>
    {parts.indexOf(part) > 0 ? <PreviousSliver width={props.width} part={part} /> : null}
      <canvas
        style={{ touchAction: "none" }}
        ref={canvasRef}
        {...props}
      ></canvas>
      { isViewingPageForActiveState ?
        <div>
        <div>Please draw {part}</div>
        <Controls />
        </div>
      :
        <Thing viewingPart={part} game={game} />
      }
    </>
  );
}
