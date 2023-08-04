import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'

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


function nextPart(part: Part):Part {
  return parts[partToState(part) + 1]
}

function UrlForActiveState(props) {
  const [ copied, setCopied ] = useState(false)

  return (
    <div>
    <label>
    <div>{props.part} done! next step:</div>
    <input readOnly type='text' value={`${import.meta.env.VITE_CLIENT_URL}${props.game.id}?part=${stateToPart(props.game.gameState)}`} />
    </label>
    <CopyToClipboard text={`${import.meta.env.VITE_CLIENT_URL}${props.game.id}?part=${stateToPart(props.game.gameState)}`} onCopy={() => setCopied(true)}>
    <button>Copy</button>
    </CopyToClipboard>
    {copied ? <span style={{color: 'green'}}> Copied!</span> : null}
    </div>
  )
}

export function Thing(props) {
  const isViewingPageForActiveState =  partToState(props.viewingPart) === props.game.gameState

  return (
    <>
     { !isViewingPageForActiveState ?
       <UrlForActiveState game={props.game} part={props.viewingPart} />
       :
       ''
     }
    </>
  )
}
