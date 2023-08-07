import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Controls } from "./Controls.js";
import { CallToAction } from "./CallToAction.js";
import * as Tone from 'tone';

type GameState = number;

const parts = ["head", "body", "feet"];

function partToState(part: string | null): GameState {
  if (part) {
    return parts.indexOf(part);
  }
  return -1;
}

function dist(pointA, pointB) {
  return Math.sqrt(Math.pow(pointB[0]-pointA[0], 2) + Math.pow(pointB[1]-pointA[1], 2))
}

export default function DrawingPad(props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingPadRef = useRef(null);
  const dotSynth = useRef(null)
  const slideSynth = useRef(null)
  const clearSynth = useRef(null)
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const part = searchParams.get("part");
  const [isViewingPageForLatestState, setIsViewingPageForLatestState] =
    useState(true);
  const [lastPoint, setLastPoint] = useState(null)

  const [strokes, setStrokes] = useState<any[]>(
    JSON.parse(localStorage.getItem(`strokes-${part}-${id}`) || "[]")
  );
  const [enabled, setEnabled] = useState(true);
  const [currentStroke, setCurrentStroke] = useState<any[]>([]);

  useEffect(() => {
    dotSynth.current = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: {
        attack: 0.005,
        decay: 0.01,
        sustain: 0,
      },
      volume: -3,
    }).toDestination()
    slideSynth.current = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0,
      },
      volume: -32,
    }).toDestination()
    clearSynth.current = new Tone.Synth({
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.001,
        decay: 0.02,
        sustain: 0,
        release: 0.01,
      },
      volume: -12,
    }).toDestination()
  }, [])

  function clear() {
    try {
      clearSynth.current.triggerAttackRelease("C3", "32n", Tone.now());
      clearSynth.current.frequency.rampTo("C7", "32n")
    } catch(e) {
      console.error(e)
    }

    setStrokes([]);
  }

  function undo() {
    try {
      clearSynth.current.triggerAttackRelease("C4", "32n", Tone.now());
      clearSynth.current.frequency.rampTo("C7", 0.01)
    } catch(e) {
      console.error(e)
    }

    setStrokes(strokes.slice(0,-1));
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
    const { top, left, width } = canvas?.getBoundingClientRect();
    const ratio = props.width / width
    const localX = (event.clientX - left) * ratio;
    const localY = (event.clientY - top) * ratio;
    setCurrentStroke([[localX, localY]]);
    setLastPoint([localX*ratio, localY])
    try {
      dotSynth.current.triggerAttackRelease(0.1, Tone.now())
    } catch(e) {
      console.error(e)
    }
  }

  function handlePointerMove(event) {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (currentStroke.length > 0) {
      const { top, left, width } = canvas?.getBoundingClientRect();
      const ratio = props.width / width
      const localX = (event.clientX - left) * ratio;
      const localY = (event.clientY - top) * ratio;
      setCurrentStroke([...currentStroke, [localX, localY]]);
      const distance = dist(lastPoint, [localX, localY])

      if (distance > 1) {
        try {
          slideSynth.current.triggerAttackRelease(0.1, Tone.now())
        } catch(e) {
          console.error(e)
        }
      }

      setLastPoint([localX, localY])
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
      //canvas.style.width = props.width + "px";
      //canvas.style.height = props.height + "px";
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

        // dot the end of each stroke
        for (let n = 0; n < strokes.length; n++) {
          const s = strokes[n]
          if (s[0]) {
            ctx.beginPath();
            ctx.arc(s[s.length-1][0], s[s.length-1][1], 1.5, 0, 2*Math.PI)
            ctx.fill();
          }
        }
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
    const drawingPad = drawingPadRef.current;

    if (drawingPad) {
      drawingPad.addEventListener("pointerdown", handlePointerDown);
      drawingPad.addEventListener("pointermove", handlePointerMove);
      drawingPad.addEventListener("pointerup", handlePointerUp);

      return () => {
        drawingPad.removeEventListener("pointerdown", handlePointerDown);
        drawingPad.removeEventListener("pointermove", handlePointerMove);
        drawingPad.removeEventListener("pointerup", handlePointerUp);
      };
    }
  });

  function PreviousSlice(props) {
    return (
      <div style={{
        width: '100%',
        height: 0,
        paddingBottom: '10%',
        overflow: 'hidden',
        pointerEvents: 'none',
        margin: '0 auto',
        position: 'relative',
        background: '#fafafa',
      }}>
        <img
          style={{
            maxWidth: '100%',
            margin: '0 auto',
            position: 'absolute',
            bottom: 0,
            left: 0,
            //width: props.width*2,
            //height: props.width*0.12,
          }}
          src={`${import.meta.env.VITE_SERVER_URL}img/${id}/${
            parts[parts.indexOf(props.part) - 1]
          }.png`}
        />
      </div>
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

  const isAfterFirstPart = partToState(part) > 0;

  return (
    <div style={{textAlign: 'center'}}>
      <div style={{padding: '2rem 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <CallToAction {...props} part={part} isThisPartOver={!isViewingPageForLatestState} />
      </div>
      <div ref={drawingPadRef} style={{touchAction: 'none', maxWidth: props.width*2, margin: '0 auto',}} className='drawing-pad'>
        <div className='smooth-shadow'>
          {isAfterFirstPart && isViewingPageForLatestState ? (
            <PreviousSlice part={part} width={props.width} />
          ) : null}
          <canvas style={{
            touchAction: "none",
            background: enabled ? '#fefefe' : 'transparent',
            maxWidth: '100%',
            display: 'block'
          }}
          ref={canvasRef}
          ></canvas>
        </div>
      </div>

      <div style={{padding: '0 0 3rem',}}>
        <Controls
          part={part}
          game={props.game}
          isThisPartOver={!isViewingPageForLatestState}
          onDone={done}
          onClear={clear}
          onUndo={undo}
          strokes={strokes}
        />
      </div>
    </div>
  );
}
