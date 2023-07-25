import { useEffect, useState, useRef } from "react"

export default function(props) {
    const [ circles, setCircles ] = useState<any[]>(JSON.parse(localStorage.getItem('circles') || '[]'))
    const cnv = useRef<HTMLCanvasElement>(null)

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
      const ctx = cnv.current?.getContext('2d');
      const ratio = window.devicePixelRatio;
      cnv.current.width = props.width * ratio
      cnv.current.height = props.height * ratio
      cnv.current.style.width = props.width + 'px'
      cnv.current.style.height = props.height + 'px'
      ctx.scale(ratio, ratio)
    }, [])

    useEffect(() => {
      const ctx = cnv.current?.getContext('2d');
      ctx.clearRect(0, 0, cnv.current.width, cnv.current.height);

      ctx.fillStyle = '#000000';
      for (let i = 0; i < circles.length; i++) {
        ctx.beginPath();
        ctx.arc(circles[i][0], circles[i][1], 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }, [circles]);

    useEffect(() => {
        cnv.current?.addEventListener('pointerdown', handlePointerDown)

        return () => {
            cnv.current?.removeEventListener('pointerdown', handlePointerDown)
        }
    })

    return (
        <>
        <canvas style={{touchAction: 'none'}} ref={cnv} {...props}></canvas>
        <div><button onClick={clear}>clear</button></div>
        </>
    )
}
