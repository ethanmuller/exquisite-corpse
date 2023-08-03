import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'

type Part = 'head' | 'body' | 'feet'
type GameState = 'PleaseDrawHead' | 'PleaseDrawBody' | 'PleaseDrawFeet' | 'Done' | null

function partToState(part: Part):GameState {
  switch(part) {
    case 'head':
      return 'PleaseDrawHead'
    case 'body':
      return 'PleaseDrawBody'
    case 'feet':
      return 'PleaseDrawFeet'
  }
  return null
}

function stateToPart(start: State):Part {
  switch(start) {
    case 'PleaseDrawHead':
      return 'head'
    case 'PleaseDrawBody':
      return 'body'
    case 'PleaseDrawFeet':
      return 'feet'
  }
  return null
}

function nextPart(part: Part):Part | null {
  switch(part) {
    case 'head':
      return 'body'
    case 'body':
      return 'feet'
    case 'feet':
      return null
  }
}

function getNextStateFromState(state) {
  switch (state) {
    case 'PleaseDrawHead':
      return 'PleaseDrawBody'
    case 'PleaseDrawBody':
      return 'PleaseDrawFeet'
    case 'PleaseDrawFeet':
      return 'Done'
    case 'Done':
      return null
  }
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
