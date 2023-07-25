import { useEffect, useState, useRef } from "react"

export default function(props) {
    const [ circles, setCircles ] = useState<any[]>(JSON.parse(localStorage.getItem('circles') || '[]'))
    const canvasRef = useRef<HTMLCanvasElement>(null)

    function clear() {
      setCircles([])
    }

    function handlePointerDown(event) {
        const { top, left } = event.target.getBoundingClientRect()
        const localX = event.clientX - left;
        const localY = event.clientY - top;
        setCircles([ ...circles, [localX, localY]])
    }

    useEffect(() => {
      localStorage.setItem('circles', JSON.stringify(circles))
    }, [circles])

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
        for (let i = 0; i < circles.length; i++) {
          ctx.beginPath();
          ctx.arc(circles[i][0], circles[i][1], 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }, [circles]);

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
          canvas.addEventListener('pointerdown', handlePointerDown)

          return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown)
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
