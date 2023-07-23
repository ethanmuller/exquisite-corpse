import { useEffect, useState, useRef } from "react"

export default function(props) {
    const [ count, setCount ] = useState(0)
    const cnv = useRef<HTMLCanvasElement>(null)

    function handlePointerDown() {
        setCount((c) => c + 1)
        console.log(count)
    }

    useEffect(() => {
        const ctx = cnv.current?.getContext('2d')
        ctx.fillStyle = '#000000'
        for (let i = 0; i < count; i++) {
            ctx.beginPath()
            ctx.arc(10*count, 100, 4, 0, 2*Math.PI)
            ctx.fill()
        }
    }, [count])

    useEffect(() => {
        cnv.current?.addEventListener('pointerdown', handlePointerDown)

        return () => {
            cnv.current?.removeEventListener('pointerdown', handlePointerDown)
        }
    })

    return (
        <>
        <canvas ref={cnv} {...props}></canvas>
        </>
    )
}