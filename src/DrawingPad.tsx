import { useEffect, useState, useRef } from "react"

export default function(props) {
  const [ strokes, setStrokes ] = useState<any[]>(JSON.parse(localStorage.getItem('strokes') || '[]'))
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function clear() {
    setStrokes([])
  }

  function handlePointerDown(event) {
    const { top, left } = event.target.getBoundingClientRect()
    const localX = event.clientX - left;
    const localY = event.clientY - top;
    setStrokes([ ...strokes, [localX, localY]])
  }

  function handlePointerMove(event) {
  }

  function handlePointerUp(event) {
  }

  useEffect(() => {
    localStorage.setItem('strokes', JSON.stringify(strokes))
  }, [strokes])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    if (canvas) {
      canvas.width = props.width * ratio
      canvas.height = props.height * ratio
      canvas.style.width = props.width + 'px'
      canvas.style.height = props.height + 'px'
    }
    ctx?.scale(ratio, ratio)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      for (let i = 0; i < strokes.length; i++) {
        ctx.beginPath();
        ctx.arc(strokes[i][0], strokes[i][1], 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown)
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('pointerup', handlePointerUp)

      return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown)
        canvas.removeEventListener('pointermove', handlePointerMove)
        canvas.removeEventListener('pointerup', handlePointerUp)
      }
    }
  })

  return (
    <>
    <canvas style={{touchAction: 'none'}} ref={canvasRef} {...props}></canvas>
    <div><button onClick={clear}>clear</button></div>
    </>
  )
}
