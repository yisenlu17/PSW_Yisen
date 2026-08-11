'use client'

import { useEffect, useState } from 'react'

/**
 * Singapore local time, wherever the visitor is.
 *
 * Renders nothing on the server: the server's clock is not Singapore's, and
 * emitting one time then correcting it on hydration is a mismatch React will
 * complain about. The dash placeholder holds the space until the real time lands.
 */
export function Clock() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const read = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date())
      )

    read()
    const id = setInterval(read, 30_000)
    return () => clearInterval(id)
  }, [])

  return <span suppressHydrationWarning>{time ?? '--:--'}</span>
}
