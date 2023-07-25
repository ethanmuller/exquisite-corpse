import { useState } from 'react'
import './App.css'
import DrawingPad from './DrawingPad.tsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
      <DrawingPad width={320} height={480} />
    </div>
    </>
  )
}

export default App
