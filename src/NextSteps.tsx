import { useState } from "react";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

type Part = "head" | "body" | "feet";
type GameState = number;

const parts = ["head", "body", "feet"];

function partToState(part: Part): GameState {
  return parts.indexOf(part);
}

function stateToPart(state: GameState): Part {
  return parts[state];
}

function nextPart(part: Part): Part {
  return parts[partToState(part) + 1];
}

function UrlForActiveState(props) {
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

function Prompt(props) {
  return <div>Please draw {props.part}</div>;
}

function Controls(props) {
  return (
    <div>
      <button onClick={props.onDone}>All Done</button>
      <button onClick={props.onClear}>Clear</button>
    </div>
  );
}

function LinkToFullCorpse(props) {
  return (
    <div>
      <div>Corpse complete!</div>
      <Link to={`/exquisite-corpse/${props.game.id}`}>View Full Corpse</Link>
    </div>
  );
}

function NextLocationView(props) {
  return props.game.gameState < 3 ? (
    <UrlForActiveState game={props.game} part={props.viewingPart} />
  ) : (
    <LinkToFullCorpse game={props.game} />
  );
}

function DrawingControlsView(props) {
  return (
    <div>
      <Prompt part={props.part} />
      <Controls onDone={props.onDone} onClear={props.onClear} />
    </div>
  );
}

export function NextSteps(props) {
  return (
    <>
      {props.isThisPartOver ? (
        <NextLocationView {...props} />
      ) : (
        <DrawingControlsView {...props} />
      )}
    </>
  );
}
