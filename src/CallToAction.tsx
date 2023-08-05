import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Link } from "react-router-dom";

const parts = ["head", "body", "feet"];

function stateToPart(state: GameState): string {
  return parts[state];
}

function copyPromptText() {
}

function CopyPrompt(props) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{fontSize: '0.75rem', lineHeight: 1.3, maxWidth: props.width, margin: '0 auto', textAlign: 'left', textWrap: 'balance', position: 'relative'}}>
      <div>Please send this to a friend to continue the drawing</div>

      <div style={{display: 'flex', width: '100%', padding: '0.25rem 0 1rem'}}>
        <input
          readOnly
          type="text"
          style={{padding: '0.5rem 0 0.5rem 0.5rem', flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
          value={`${import.meta.env.VITE_CLIENT_URL}${
            props.game.id
          }?part=${stateToPart(props.game.gameState)}`}
        />
        <CopyToClipboard
          text={`${import.meta.env.VITE_CLIENT_URL}${
            props.game.id
          }?part=${stateToPart(props.game.gameState)}`}
          onCopy={() => setCopied(true)}
        >
          <button className='btn__primary' style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}>Copy</button>
        </CopyToClipboard>
      </div>
      {copied ? <span style={{ color: "green", fontFamily: 'Inter, sans-serif', position: 'absolute', textAlign: 'right', width: '100%', marginTop: '-0.75rem'}}> Copied to clipboard</span> : null}
    </div>
  );
}

function DrawPrompt(props) {
  return <div>Please draw <strong>the {props.part}</strong></div>
}

function LinkToFullCorpse(props) {
  return (
    <div>
      <div>This corpse is complete.</div>
      <Link to={`/exquisite-corpse/${props.game.id}`}>View Full Corpse</Link>
    </div>
  );
}

export function CallToAction(props) {
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
