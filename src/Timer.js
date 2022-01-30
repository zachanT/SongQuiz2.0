import { useState, useEffect } from 'react'

export const Timer = ({ setOutOfTime, is_paused, inGame, guessing }) => {
    const [timer, setTimer] = useState(7)

    useEffect(() => {
        if(timer === 0) return setOutOfTime(true)
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [timer])

    useEffect(() => {
        if(guessing) {
            setTimer(7)
            setOutOfTime(false)
        }
    }, [guessing])

    return (
        timer
    )
}
